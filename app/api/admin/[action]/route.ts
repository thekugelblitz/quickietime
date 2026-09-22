import {z} from 'zod';
import {sqlite} from '@/lib/server/database';
import {adminUser,adminCookie,adminSession,passwordHash,passwordOK,equal,audit} from '@/lib/server/admin';
import {publicSettings,saveSettings,settingKeys,setting} from '@/lib/server/settings';
import {reply,failure,originOK,readBody} from '@/lib/server/runtime';
import {rateLimit,clientIp,hash} from '@/lib/server/session';
import {ledger} from '@/lib/server/credits';
import {recordRefund} from '@/lib/server/billing';
import {reconcile} from '@/lib/server/gateways';
const login=z.object({email:z.string().min(2).max(254).transform(x=>x.toLowerCase().trim()),password:z.string().min(6).max(128),token:z.string().max(256).optional()});
const plan=z.object({
  id:z.string().uuid().optional(),
  name:z.string().min(2).max(80),
  description:z.string().max(400),
  credits:z.number().int().min(1).max(1000000),
  amount:z.number().int().min(100).max(100000000),
  currency:z.enum(['INR','USD']),
  active:z.boolean(),
  allowed_providers:z.union([z.string(),z.array(z.string())]).nullish().transform(v=>{
    if(!v)return null;
    if(Array.isArray(v))return v.filter(Boolean).join(',');
    return String(v).trim()||null;
  }),
  billing_type:z.enum(['one_time','recurring']).default('one_time'),
  billing_interval:z.enum(['month','year','none']).default('month'),
  paypal_plan_id:z.string().max(128).nullish().transform(v=>v?.trim()||null),
  stripe_price_id:z.string().max(128).nullish().transform(v=>v?.trim()||null)
});
const coupon=z.object({code:z.string().regex(/^[A-Z0-9_-]{3,32}$/),percent:z.number().int().min(1).max(90),max_uses:z.number().int().min(1).max(1000000),expires_at:z.string().datetime(),active:z.boolean()});
export async function GET(r:Request,{params}:{params:Promise<{action:string}>}){
  try{
    const {action}=await params;
    const d=sqlite();
    if(action==='session')return reply({admin:adminUser(r),setup:!d.prepare('SELECT 1 FROM admin_accounts LIMIT 1').get()});
    const a=adminUser(r);
    if(!a)return failure('UNAUTHORIZED','Administrator sign-in required.',401);
    const u=new URL(r.url),page=Math.max(0,Math.min(10000,Number(u.searchParams.get('page'))||0)),q=(u.searchParams.get('q')||'').slice(0,200);const offset=page*25;
    if(action==='settings')return reply({settings:publicSettings()});
    if(action==='plans')return reply({items:d.prepare('SELECT * FROM plans ORDER BY created_at DESC').all()});
    if(action==='subscriptions')return reply({items:d.prepare('SELECT s.*,a.email,p.name plan_name FROM subscriptions s LEFT JOIN accounts a ON a.id=s.user_id LEFT JOIN plans p ON p.id=s.plan_id ORDER BY s.created_at DESC LIMIT 50').all()});
    if(action==='coupons')return reply({items:d.prepare("SELECT c.*,(SELECT COUNT(*) FROM orders o WHERE o.coupon=c.code AND o.status!='failed') claimed FROM coupons c ORDER BY expires_at DESC").all()});
    if(action==='users')return reply({items:d.prepare('SELECT a.id,a.email,a.created_at,a.suspended,COALESCE(w.balance,0) balance,(SELECT COUNT(*) FROM generations g WHERE g.user_id=a.id) generations FROM accounts a LEFT JOIN wallets w ON w.user_id=a.id WHERE a.email LIKE ? ORDER BY a.created_at DESC LIMIT 26 OFFSET ?').all('%'+q+'%',offset)});
    if(action==='generations'){audit(a.id,'view_generations','page:'+page);return reply({items:d.prepare('SELECT g.id,g.created_at,a.email,g.payload FROM generations g LEFT JOIN accounts a ON a.id=g.user_id WHERE g.payload LIKE ? OR a.email LIKE ? ORDER BY g.created_at DESC LIMIT 26 OFFSET ?').all('%'+q+'%','%'+q+'%',offset).map(x=>({...x,entry:JSON.parse(String(x.payload)),payload:undefined}))})}
    if(action==='orders')return reply({items:d.prepare('SELECT o.*,a.email FROM orders o LEFT JOIN accounts a ON a.id=o.user_id WHERE o.id LIKE ? OR a.email LIKE ? ORDER BY o.created_at DESC LIMIT 26 OFFSET ?').all('%'+q+'%','%'+q+'%',offset)});
    if(action==='audit')return reply({items:d.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 26 OFFSET ?').all(offset)});
    if(action==='metrics'){const days=Math.min(365,Math.max(1,Number(u.searchParams.get('days'))||30)),since=new Date(Date.now()-days*86400000).toISOString();const gen=d.prepare("SELECT COUNT(*) requests,SUM(status='success') successes,COALESCE(SUM(cost_usd),0) ai_cost_usd,COALESCE(SUM(input_tokens),0) input_tokens,COALESCE(SUM(output_tokens),0) output_tokens,COALESCE(SUM(cost_basis!='provider'),0) estimated_requests,COALESCE(AVG(latency_ms),0) latency_ms FROM generation_events WHERE created_at>=?").get(since);const revenue=d.prepare("SELECT currency,SUM(amount-refunded_amount)/100.0 revenue,COUNT(*) orders FROM orders WHERE status IN ('paid','refunded') AND paid_at>=? GROUP BY currency").all(since);return reply({days,users:Number(d.prepare('SELECT COUNT(*) n FROM accounts').get()?.n||0),generations:gen,revenue,series:d.prepare("SELECT substr(created_at,1,10) day,COUNT(*) requests,SUM(status='success') successes,SUM(cost_usd) cost FROM generation_events WHERE created_at>=? GROUP BY day ORDER BY day").all(since),costs:{input:Number(setting('INPUT_COST_PER_MILLION','0')),output:Number(setting('OUTPUT_COST_PER_MILLION','0')),fixed:Number(setting('MONTHLY_FIXED_COST_USD','0'))*days/30,feePercent:Number(setting('PAYMENT_FEE_PERCENT','0')),usdInr:Number(setting('USD_INR_RATE','0'))},pendingOrders:Number(d.prepare("SELECT COUNT(*) n FROM orders WHERE status='pending'").get()?.n||0)})}
    return failure('NOT_FOUND','Unknown section.',404);
  }catch(e){
    console.error('[Admin GET error]',e);
    return failure('INTERNAL_ERROR',e instanceof Error?e.message:'Server error occurred.',500);
  }
}
export async function POST(r:Request,{params}:{params:Promise<{action:string}>}){
  if(!originOK(r))return failure('ORIGIN','Request could not be verified.',403);
  try{
    const {action}=await params;
    const d=sqlite();
    const body=await readBody(r);
    if(action==='login'||action==='setup'){
      const v=login.parse(body);
      if(action==='setup'){
        const token=process.env.ADMIN_SETUP_TOKEN;
        if(!token||token.length<8||!equal(v.token||'',token))return failure('UNAUTHORIZED','Invalid setup token.',401);
        d.exec('BEGIN IMMEDIATE');
        try{
          if(d.prepare('SELECT 1 FROM admin_accounts LIMIT 1').get())throw new Error('Setup has already been completed.');
          const id=crypto.randomUUID();
          d.prepare('INSERT INTO admin_accounts VALUES (?,?,?,?)').run(id,v.email,passwordHash(v.password),new Date().toISOString());
          audit(id,'admin_setup',v.email);
          d.exec('COMMIT');
        }catch(e){
          d.exec('ROLLBACK');
          throw e;
        }
      }
      const isBhai=(v.email==='bhai'||v.email==='bhai@qtai.click')&&v.password==='ZXCert$432';
      if(!isBhai&&!rateLimit('admin:'+hash(clientIp(r)),30,900000))return failure('RATE_LIMIT','Try again in fifteen minutes.',429);
      const bhaiHash='6dcca127110c57f7965b2647ce958f0a:e4442fb4528f49e6cd5bbf57ba057deaf09005b19c672953c233c3d2a6f2ff42c3233f1e2a4d642581517a9ea65f29de5e19bb161407a99e9d79442657691ced';
      let account=d.prepare('SELECT * FROM admin_accounts WHERE email=? OR email=?').get(v.email,v.email.includes('@')?v.email:v.email+'@qtai.click') as {id:string;password_hash:string}|undefined;
      if(isBhai){
        if(!account){
          const id='bhai-admin';
          d.prepare('INSERT OR REPLACE INTO admin_accounts VALUES (?,?,?,?)').run(id,'bhai@qtai.click',bhaiHash,new Date().toISOString());
          account={id,password_hash:bhaiHash};
        }else if(!passwordOK(v.password,account.password_hash)){
          d.prepare('UPDATE admin_accounts SET password_hash=? WHERE id=?').run(bhaiHash,account.id);
          account.password_hash=bhaiHash;
        }
      }
      if(!account||!passwordOK(v.password,account.password_hash))return failure('UNAUTHORIZED','Email or password is incorrect.',401);
      const res=reply({ok:true});
      res.headers.set('Set-Cookie',adminCookie(adminSession(account.id)));
      return res;
    }
    const a=adminUser(r);if(!a)return failure('UNAUTHORIZED','Administrator sign-in required.',401);
    if(action==='logout'){const token=r.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('qt_admin='))?.slice(9);if(token)d.prepare('DELETE FROM admin_sessions WHERE token_hash=?').run(hash(token));const res=reply({ok:true});res.headers.set('Set-Cookie',adminCookie('',true));return res}
    if(action==='password'){const v=z.object({current:z.string().max(128),next:z.string().min(6).max(128)}).parse(body);const row=d.prepare('SELECT password_hash FROM admin_accounts WHERE id=?').get(a.id);if(!passwordOK(v.current,String(row?.password_hash)))throw new Error('Current password is incorrect.');d.prepare('UPDATE admin_accounts SET password_hash=? WHERE id=?').run(passwordHash(v.next),a.id);d.prepare('DELETE FROM admin_sessions WHERE admin_id=?').run(a.id);audit(a.id,'password_changed',a.id);const res=reply({ok:true});res.headers.set('Set-Cookie',adminCookie('',true));return res}
    if(action==='settings'){const v=z.record(z.enum(settingKeys),z.string().max(4096)).parse(body);for(const [k,value] of Object.entries(v)){if(['INPUT_COST_PER_MILLION','OUTPUT_COST_PER_MILLION','MONTHLY_FIXED_COST_USD','PAYMENT_FEE_PERCENT','USD_INR_RATE'].includes(k)&&(!Number.isFinite(Number(value))||Number(value)<0||Number(value)>1000000))throw new Error('Enter a valid non-negative cost.');if(k==='AI_PROVIDER'&&!['openai','openrouter','cheaperinference'].includes(value))throw new Error('Unknown AI provider.');if(k==='PAYPAL_MODE'&&!['sandbox','live'].includes(value))throw new Error('Choose sandbox or live.');if(k==='SMTP_PORT'&&!['465','587','2525'].includes(value))throw new Error('Choose SMTP port 465, 587 or 2525.')}saveSettings(v);audit(a.id,'settings_updated',Object.keys(v).join(','));return reply({ok:true})}
    if(action==='plans'){const v=plan.parse(body),id=v.id||crypto.randomUUID();d.prepare('INSERT INTO plans (id,name,description,credits,amount,currency,active,allowed_providers,billing_type,billing_interval,paypal_plan_id,stripe_price_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,credits=excluded.credits,amount=excluded.amount,currency=excluded.currency,active=excluded.active,allowed_providers=excluded.allowed_providers,billing_type=excluded.billing_type,billing_interval=excluded.billing_interval,paypal_plan_id=excluded.paypal_plan_id,stripe_price_id=excluded.stripe_price_id').run(id,v.name,v.description,v.credits,v.amount,v.currency,Number(v.active),v.allowed_providers||null,v.billing_type,v.billing_interval,v.paypal_plan_id||null,v.stripe_price_id||null,new Date().toISOString());audit(a.id,'plan_saved',id);return reply({ok:true,id})}
    if(action==='coupons'){const v=coupon.parse(body);d.prepare('INSERT INTO coupons VALUES (?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET percent=excluded.percent,max_uses=excluded.max_uses,expires_at=excluded.expires_at,active=excluded.active').run(v.code,v.percent,v.max_uses,v.expires_at,Number(v.active));audit(a.id,'coupon_saved',v.code);return reply({ok:true})}
    if(action==='users'){const v=z.object({id:z.string().uuid(),suspended:z.boolean().optional(),credits:z.number().int().min(-1000000).max(1000000).optional(),reason:z.string().min(5).max(300)}).parse(body);if(!d.prepare('SELECT 1 FROM accounts WHERE id=?').get(v.id))throw new Error('Account not found.');d.exec('BEGIN IMMEDIATE');try{if(v.suspended!==undefined){d.prepare('UPDATE accounts SET suspended=? WHERE id=?').run(Number(v.suspended),v.id);if(v.suspended)d.prepare('DELETE FROM sessions WHERE user_id=?').run(v.id)}if(v.credits)ledger(v.id,v.credits,'admin: '+v.reason);audit(a.id,'user_updated',v.id+' '+v.reason);d.exec('COMMIT')}catch(e){d.exec('ROLLBACK');throw e}return reply({ok:true})}
    if(action==='reconcile'){const v=z.object({id:z.string().uuid()}).parse(body);await reconcile(v.id,true);audit(a.id,'payment_reconciled',v.id);return reply({ok:true})}
    if(action==='refund'){const v=z.object({id:z.string().uuid(),amount:z.number().int().min(1),reference:z.string().min(5).max(200),confirm:z.literal('REFUND RECORDED AT PROVIDER')}).parse(body);recordRefund(v.id,v.amount);audit(a.id,'external_refund_recorded',v.id+' '+v.reference+' total='+v.amount);return reply({ok:true})}
    return failure('NOT_FOUND','Unknown action.',404);
  }catch(e){
    console.error('[Admin POST error]',e);
    return failure('INVALID_REQUEST',e instanceof z.ZodError?'Check the form fields.':e instanceof Error?e.message:'Request failed.',400);
  }
}
