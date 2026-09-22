import {createHmac} from 'node:crypto';
import {equal} from './admin';
import {setting} from './settings';
import {getOrder,getPlan,fulfill,recordSubscription,fulfillSubscriptionRenewal,type Order,type Provider,type Plan,type Subscription} from './billing';
import {sqlite} from './database';
import {siteUrl} from '../site';

type Remote={
  id:string;
  url?:string;
  short_url?:string;
  access_token?:string;
  verification_status?:string;
  status?:string;
  payment_status?:string;
  amount_total?:number;
  amount?:number;
  amount_paid?:number;
  currency?:string;
  reference_id?:string;
  client_reference_id?:string;
  subscription?:string;
  links?:{rel:string;href:string}[];
  purchase_units?:{reference_id?:string;amount?:{value:string;currency_code:string};payments?:{captures?:{id:string;status:string;amount:{value:string;currency_code:string}}[]}}[];
  error?:unknown;
};

async function call(url:string,init:RequestInit={}){
  const r=await fetch(url,{...init,signal:AbortSignal.timeout(20000)});
  if(!r.ok){
    let errorDetail = '';
    try {
      const errJson = await r.json();
      errorDetail = errJson.message || errJson.error_description || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Payment provider request failed: ${r.status}${errorDetail ? ` (${errorDetail})` : ''}. Please retry or contact support.`);
  }
  return await r.json() as Remote;
}

function basic(a:string,b:string){return 'Basic '+Buffer.from(a+':'+b).toString('base64')}

function paypalBase(){return setting('PAYPAL_MODE','sandbox')==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com'}

async function paypalToken(){
  const r=await call(paypalBase()+'/v1/oauth2/token',{
    method:'POST',
    headers:{
      Authorization:basic(setting('PAYPAL_CLIENT_ID'),setting('PAYPAL_CLIENT_SECRET')),
      'Content-Type':'application/x-www-form-urlencoded'
    },
    body:'grant_type=client_credentials'
  });
  if(!r.access_token)throw new Error('PayPal connection failed. Check your Client ID and Secret.');
  return r.access_token;
}

async function ensurePaypalBillingPlan(plan: Plan, token: string): Promise<string> {
  if (plan.paypal_plan_id) return plan.paypal_plan_id;
  const base = paypalBase();
  // 1. Create product
  const prodRes = await call(base + '/v1/catalogs/products', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'QuickieTime ' + plan.name,
      description: plan.description || 'QuickieTime writing subscription',
      type: 'DIGITAL',
      category: 'SOFTWARE'
    })
  });
  const productId = prodRes.id;

  // 2. Create billing plan
  const intervalUnit = plan.billing_interval === 'year' ? 'YEAR' : 'MONTH';
  const planRes = await call(base + '/v1/billing/plans', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      name: plan.name,
      description: plan.description || `${plan.credits} credits per ${intervalUnit.toLowerCase()}`,
      billing_cycles: [
        {
          frequency: { interval_unit: intervalUnit, interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: (plan.amount / 100).toFixed(2),
              currency_code: plan.currency
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    })
  });
  const createdPlanId = planRes.id;
  sqlite().prepare('UPDATE plans SET paypal_plan_id=? WHERE id=?').run(createdPlanId, plan.id);
  return createdPlanId;
}

const checkoutJobs=new Map<string,Promise<string>>();

export async function startCheckout(o:Order){
  if(o.checkout_url)return o.checkout_url;
  const running=checkoutJobs.get(o.id);
  if(running)return running;
  const job=createCheckout(o).finally(()=>checkoutJobs.delete(o.id));
  checkoutJobs.set(o.id,job);
  return job;
}

async function createCheckout(o:Order){
  let r:Remote;
  let url:string|undefined;
  const plan = getPlan(o.plan_id);
  const isRecurring = o.billing_type === 'recurring' || plan?.billing_type === 'recurring';
  const interval = plan?.billing_interval === 'year' ? 'year' : 'month';

  if(o.provider==='stripe'){
    const form=new URLSearchParams({
      mode: isRecurring ? 'subscription' : 'payment',
      client_reference_id:o.id,
      success_url:siteUrl+'/checkout?order='+o.id,
      cancel_url:siteUrl+'/checkout?order='+o.id+'&cancelled=1',
      'line_items[0][price_data][currency]':o.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]':String(o.amount),
      'line_items[0][price_data][product_data][name]':o.plan_name+' — '+o.credits+' credits'+(isRecurring ? ' / '+interval : ''),
      'line_items[0][quantity]':'1',
      'metadata[order_id]':o.id,
      'metadata[plan_id]':o.plan_id,
      'metadata[user_id]':o.user_id||''
    });
    if(isRecurring){
      form.set('line_items[0][price_data][recurring][interval]', interval);
    }
    r=await call('https://api.stripe.com/v1/checkout/sessions',{
      method:'POST',
      headers:{
        Authorization:'Bearer '+setting('STRIPE_SECRET_KEY'),
        'Content-Type':'application/x-www-form-urlencoded',
        'Idempotency-Key':o.id
      },
      body:form
    });
    url=r.url;
  }
  else if(o.provider==='paypal'){
    const token = await paypalToken();
    if(isRecurring && plan){
      try {
        const paypalPlanId = await ensurePaypalBillingPlan(plan, token);
        r = await call(paypalBase() + '/v1/billing/subscriptions', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': o.id
          },
          body: JSON.stringify({
            plan_id: paypalPlanId,
            custom_id: o.id,
            application_context: {
              brand_name: 'QuickieTime',
              user_action: 'SUBSCRIBE_NOW',
              return_url: siteUrl + '/checkout?order=' + o.id,
              cancel_url: siteUrl + '/checkout?order=' + o.id + '&cancelled=1'
            }
          })
        });
        url = r.links?.find(l => ['approve', 'payer-action'].includes(l.rel))?.href;
      } catch (subErr) {
        console.warn('[PayPal Subscription Fallback to Standard Order]:', subErr);
        // Graceful fallback to Orders v2
        r=await call(paypalBase()+'/v2/checkout/orders',{
          method:'POST',
          headers:{
            Authorization:'Bearer '+token,
            'Content-Type':'application/json',
            'PayPal-Request-Id':o.id
          },
          body:JSON.stringify({
            intent:'CAPTURE',
            purchase_units:[{reference_id:o.id,custom_id:o.id,description:o.plan_name,amount:{currency_code:o.currency,value:(o.amount/100).toFixed(2)}}],
            payment_source:{paypal:{experience_context:{return_url:siteUrl+'/checkout?order='+o.id,cancel_url:siteUrl+'/checkout?order='+o.id+'&cancelled=1',user_action:'PAY_NOW'}}}
          })
        });
        url=r.links?.find(l=>['payer-action','approve'].includes(l.rel))?.href;
      }
    } else {
      r=await call(paypalBase()+'/v2/checkout/orders',{
        method:'POST',
        headers:{
          Authorization:'Bearer '+token,
          'Content-Type':'application/json',
          'PayPal-Request-Id':o.id
        },
        body:JSON.stringify({
          intent:'CAPTURE',
          purchase_units:[{reference_id:o.id,custom_id:o.id,description:o.plan_name,amount:{currency_code:o.currency,value:(o.amount/100).toFixed(2)}}],
          payment_source:{paypal:{experience_context:{return_url:siteUrl+'/checkout?order='+o.id,cancel_url:siteUrl+'/checkout?order='+o.id+'&cancelled=1',user_action:'PAY_NOW'}}}
        })
      });
      url=r.links?.find(l=>['payer-action','approve'].includes(l.rel))?.href;
    }
  }
  else{
    r=await call('https://api.razorpay.com/v1/payment_links',{
      method:'POST',
      headers:{
        Authorization:basic(setting('RAZORPAY_KEY_ID'),setting('RAZORPAY_KEY_SECRET')),
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        amount:o.amount,
        currency:o.currency,
        accept_partial:false,
        reference_id:o.id,
        description:o.plan_name+' — '+o.credits+' credits'+(isRecurring ? ' / '+interval : ''),
        notify:{sms:false,email:false},
        reminder_enable:false,
        callback_url:siteUrl+'/checkout?order='+o.id,
        callback_method:'get',
        notes:{order_id:o.id,billing_type:isRecurring?'recurring':'one_time'}
      })
    });
    url=r.short_url;
  }

  if(!r.id||!url||!safeCheckoutURL(url))throw new Error('Payment provider did not return a valid checkout URL.');
  sqlite().prepare('UPDATE orders SET provider_id=?,checkout_url=? WHERE id=?').run(r.id,url,o.id);
  return url;
}

export function safeCheckoutURL(url:string){
  try{
    const u=new URL(url);
    return u.protocol==='https:'&&['checkout.stripe.com','www.paypal.com','www.sandbox.paypal.com','rzp.io','rzp.to'].includes(u.hostname);
  }catch{return false}
}

export async function reconcile(id:string,capture=false){
  const o=getOrder(id);
  if(!o||!o.provider_id)throw new Error('Checkout is not ready.');
  if(['paid','refunded'].includes(o.status))return o;
  const plan = getPlan(o.plan_id);
  const isRecurring = o.billing_type === 'recurring' || plan?.billing_type === 'recurring';
  let r:Remote;

  if(o.provider==='stripe'){
    r=await call('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(o.provider_id),{
      headers:{Authorization:'Bearer '+setting('STRIPE_SECRET_KEY')}
    });
    const paid = r.payment_status === 'paid' || (isRecurring && r.status === 'complete');
    if(paid && r.client_reference_id===o.id){
      fulfill(o.id,r.id,r.amount_total||o.amount,r.currency||o.currency);
      if(isRecurring && r.subscription && o.user_id){
        recordSubscription(
          o.user_id,
          o.plan_id,
          'stripe',
          String(r.subscription),
          o.credits,
          o.amount,
          o.currency,
          plan?.billing_interval || 'month'
        );
      }
    }
  }
  else if(o.provider==='razorpay'){
    r=await call('https://api.razorpay.com/v1/payment_links/'+encodeURIComponent(o.provider_id),{
      headers:{Authorization:basic(setting('RAZORPAY_KEY_ID'),setting('RAZORPAY_KEY_SECRET'))}
    });
    if(r.status==='paid'&&r.reference_id===o.id&&r.amount_paid===o.amount){
      fulfill(o.id,r.id,r.amount!,r.currency!);
    }
  }
  else{
    if(isRecurring && o.provider_id.startsWith('I-')){
      const token = await paypalToken();
      const endpoint = paypalBase() + '/v1/billing/subscriptions/' + encodeURIComponent(o.provider_id);
      r = await call(endpoint, { headers: { Authorization: 'Bearer ' + token } });
      if(['ACTIVE','APPROVED'].includes(String(r.status))){
        fulfill(o.id, o.provider_id, o.amount, o.currency);
        if(o.user_id){
          recordSubscription(
            o.user_id,
            o.plan_id,
            'paypal',
            o.provider_id,
            o.credits,
            o.amount,
            o.currency,
            plan?.billing_interval || 'month'
          );
        }
      }
    } else {
      const headers={
        Authorization:'Bearer '+await paypalToken(),
        'Content-Type':'application/json',
        'PayPal-Request-Id':'capture-'+o.id
      };
      const endpoint=paypalBase()+'/v2/checkout/orders/'+encodeURIComponent(o.provider_id);
      r=await call(endpoint,{headers});
      if(capture&&r.status==='APPROVED'){
        r=await call(endpoint+'/capture',{method:'POST',headers,body:'{}'});
      }
      const units=r.purchase_units||[];
      const captures=units.flatMap(p=>p.payments?.captures||[]);
      if(r.status==='COMPLETED'&&units[0]?.reference_id===o.id&&captures.length===1&&captures[0].status==='COMPLETED'){
        fulfill(o.id,r.id,Math.round(Number(captures[0].amount.value)*100),captures[0].amount.currency_code);
      }
    }
  }
  return getOrder(o.id)!;
}

export function verifyHmac(provider:'stripe'|'razorpay',body:string,signature:string,now=Date.now()){
  if(provider==='razorpay'){
    const secret=setting('RAZORPAY_WEBHOOK_SECRET');
    return !!secret&&equal(createHmac('sha256',secret).update(body).digest('hex'),signature);
  }
  const fields=signature.split(',').map(p=>p.split('='));
  const t=fields.find(p=>p[0]==='t')?.[1];
  const secret=setting('STRIPE_WEBHOOK_SECRET');
  return !!secret&&!!t&&Math.abs(now/1000-Number(t))<=300&&fields.filter(p=>p[0]==='v1').some(p=>equal(p[1]||'',createHmac('sha256',secret).update(t+'.'+body).digest('hex')));
}

export async function verifyPaypal(headers:Headers,event:unknown){
  const webhookId = setting('PAYPAL_WEBHOOK_ID');
  if(!webhookId) return false;
  const r=await call(paypalBase()+'/v1/notifications/verify-webhook-signature',{
    method:'POST',
    headers:{Authorization:'Bearer '+await paypalToken(),'Content-Type':'application/json'},
    body:JSON.stringify({
      auth_algo:headers.get('paypal-auth-algo'),
      cert_url:headers.get('paypal-cert-url'),
      transmission_id:headers.get('paypal-transmission-id'),
      transmission_sig:headers.get('paypal-transmission-sig'),
      transmission_time:headers.get('paypal-transmission-time'),
      webhook_id:webhookId,
      webhook_event:event
    })
  });
  return r.verification_status==='SUCCESS';
}

async function webhookBody(r:Request){
  const reader=r.body?.getReader();
  if(!reader)throw new Error('Missing payload');
  const parts:Uint8Array[]=[];
  let length=0;
  while(true){
    const part=await reader.read();
    if(part.done)break;
    length+=part.value.length;
    if(length>500000){await reader.cancel();throw new Error('Payload too large')}
    parts.push(part.value);
  }
  return Buffer.concat(parts).toString('utf8');
}

export async function webhook(provider:Provider,r:Request){
  const raw=await webhookBody(r);
  const e=JSON.parse(raw);
  const verified=provider==='paypal'
    ? await verifyPaypal(r.headers,e)
    : verifyHmac(provider,raw,r.headers.get(provider==='stripe'?'stripe-signature':'x-razorpay-signature')||'');
  if(!verified)throw new Error('Invalid signature');
  const eventId=provider+':'+(e.id||r.headers.get('x-razorpay-event-id'));
  if(eventId.endsWith('undefined')||eventId.endsWith('null'))throw new Error('Missing event ID');
  if(sqlite().prepare('SELECT 1 FROM webhook_events WHERE id=?').get(eventId))return;

  const type=e.type||e.event_type||e.event;
  let providerId:string|undefined;

  if(provider==='stripe'){
    if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(type)){
      providerId=e.data?.object?.id;
    } else if (type === 'invoice.payment_succeeded') {
      const subId = e.data?.object?.subscription;
      if (subId) fulfillSubscriptionRenewal(String(subId), 0, eventId);
    }
  }

  if(provider==='razorpay'&&type==='payment_link.paid'){
    providerId=e.payload?.payment_link?.entity?.id;
  }

  if(provider==='paypal'){
    if(['CHECKOUT.ORDER.APPROVED','PAYMENT.CAPTURE.COMPLETED'].includes(type)){
      providerId=type==='CHECKOUT.ORDER.APPROVED'?e.resource?.id:e.resource?.supplementary_data?.related_ids?.order_id;
    } else if (type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      providerId = e.resource?.id;
      const customId = e.resource?.custom_id;
      if (customId) {
        sqlite().prepare('UPDATE orders SET provider_id=? WHERE id=?').run(providerId || null, customId);
        await reconcile(String(customId), true);
      }
    } else if (type === 'PAYMENT.SALE.COMPLETED') {
      const agreementId = e.resource?.billing_agreement_id;
      if (agreementId) fulfillSubscriptionRenewal(String(agreementId), 0, eventId);
    }
  }

  if(providerId){
    const o=sqlite().prepare('SELECT id FROM orders WHERE provider=? AND provider_id=?').get(provider,providerId);
    if(!o)throw new Error('Order mapping not ready; retry webhook.');
    await reconcile(String(o.id),provider==='paypal');
  }
  sqlite().prepare('INSERT OR IGNORE INTO webhook_events VALUES (?,?,?,?)').run(eventId,provider,String(type),new Date().toISOString());
}

export async function cancelSubscription(userId: string, subId: string) {
  const d = sqlite();
  const sub = d.prepare('SELECT * FROM subscriptions WHERE (id=? OR provider_subscription_id=?) AND user_id=?').get(subId, subId, userId) as Subscription | undefined;
  if (!sub) throw new Error('Subscription not found.');
  try {
    if (sub.provider === 'stripe' && setting('STRIPE_SECRET_KEY')) {
      await fetch('https://api.stripe.com/v1/subscriptions/' + encodeURIComponent(sub.provider_subscription_id), {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + setting('STRIPE_SECRET_KEY') }
      });
    } else if (sub.provider === 'paypal' && setting('PAYPAL_CLIENT_ID')) {
      await fetch(paypalBase() + '/v1/billing/subscriptions/' + encodeURIComponent(sub.provider_subscription_id) + '/cancel', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + await paypalToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Customer cancelled subscription' })
      });
    }
  } catch (err) {
    console.warn('[Remote Subscription Cancel Notice]:', err);
  }
  d.prepare("UPDATE subscriptions SET status='cancelled', cancel_at_period_end=1, updated_at=? WHERE id=?").run(new Date().toISOString(), sub.id);
  return { ok: true, id: sub.id, status: 'cancelled' };
}
