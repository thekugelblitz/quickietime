import {sqlite} from './database';
import {ledger} from './credits';
import {setting} from './settings';

export type Provider = 'stripe' | 'paypal' | 'razorpay';
export type BillingType = 'one_time' | 'recurring';
export type BillingInterval = 'month' | 'year' | 'none';

export type Plan = {
  id: string;
  name: string;
  description: string;
  credits: number;
  amount: number;
  currency: 'INR' | 'USD';
  active: number;
  allowed_providers?: string | null;
  billing_type?: BillingType;
  billing_interval?: BillingInterval;
  paypal_plan_id?: string | null;
  stripe_price_id?: string | null;
  created_at?: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  plan_id: string;
  plan_name: string;
  credits: number;
  amount: number;
  currency: string;
  provider: Provider;
  provider_id: string | null;
  checkout_url: string | null;
  status: string;
  coupon: string | null;
  billing_type?: BillingType;
  subscription_id?: string | null;
  created_at: string;
  paid_at: string | null;
  refunded_amount: number;
  revoked_credits: number;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  provider: Provider;
  provider_subscription_id: string;
  status: string;
  credits_per_cycle: number;
  amount: number;
  currency: string;
  interval: string;
  current_period_end?: string | null;
  cancel_at_period_end: number;
  created_at: string;
  updated_at: string;
};

export function providers(currency?: string, allowed?: string | string[] | null): Provider[] {
  try {
    const configured: Provider[] = [];
    if (setting('STRIPE_SECRET_KEY')) configured.push('stripe');
    if (setting('PAYPAL_CLIENT_ID') && setting('PAYPAL_CLIENT_SECRET')) configured.push('paypal');
    if (setting('RAZORPAY_KEY_ID') && setting('RAZORPAY_KEY_SECRET')) configured.push('razorpay');

    let list = configured;
    if (allowed) {
      const allowedArr = Array.isArray(allowed)
        ? allowed.map(s => String(s).trim().toLowerCase())
        : String(allowed).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (allowedArr.length > 0) {
        list = list.filter(p => allowedArr.includes(p));
      }
    }

    return list.filter(p => {
      if (p === 'paypal' && currency === 'INR') return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function plans(): Plan[] {
  return sqlite().prepare('SELECT * FROM plans WHERE active=1 ORDER BY amount').all() as Plan[];
}

export function getPlan(id: string): Plan | undefined {
  return sqlite().prepare('SELECT * FROM plans WHERE id=?').get(id) as Plan | undefined;
}

export function getOrder(id: string): Order | undefined {
  return sqlite().prepare('SELECT * FROM orders WHERE id=?').get(id) as Order | undefined;
}

export function makeOrder(uid: string, planId: string, provider: Provider, coupon: string, requestKey: string) {
  const d = sqlite();
  const prior = d.prepare('SELECT * FROM orders WHERE user_id=? AND request_key=?').get(uid, requestKey) as Order | undefined;
  if (prior) return prior;
  d.exec('BEGIN IMMEDIATE');
  try {
    const p = d.prepare('SELECT * FROM plans WHERE id=? AND active=1').get(planId) as Plan | undefined;
    if (!p) throw new Error('This pack is unavailable.');
    const available = providers(p.currency, p.allowed_providers);
    if (!available.includes(provider)) throw new Error('This payment method is unavailable for that pack or currency.');
    let amount = p.amount;
    if (coupon) {
      const c = d.prepare('SELECT * FROM coupons WHERE code=? AND active=1 AND expires_at>?').get(coupon, new Date().toISOString()) as {percent: number; max_uses: number} | undefined;
      const used = Number(d.prepare("SELECT COUNT(*) n FROM orders WHERE coupon=? AND status!='failed'").get(coupon)?.n || 0);
      if (!c || used >= c.max_uses) throw new Error('Coupon is invalid, expired or fully claimed.');
      if (d.prepare("SELECT 1 FROM orders WHERE user_id=? AND coupon=? AND status!='failed'").get(uid, coupon)) throw new Error('This coupon has already been claimed by your account.');
      amount = Math.round(amount * (100 - c.percent) / 100);
      if (amount < (p.currency === 'USD' ? 50 : 100)) throw new Error('This coupon reduces the total below the payment provider minimum.');
    }
    const id = crypto.randomUUID();
    const billingType = p.billing_type || 'one_time';
    d.prepare('INSERT INTO orders (id,user_id,plan_id,plan_name,credits,amount,currency,provider,coupon,request_key,billing_type,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, uid, p.id, p.name, p.credits, amount, p.currency, provider, coupon || null, requestKey, billingType, new Date().toISOString());
    d.exec('COMMIT');
    return getOrder(id)!;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

export function fulfill(id: string, providerId: string, amount: number, currency: string) {
  const d = sqlite();
  d.exec('BEGIN IMMEDIATE');
  try {
    const o = getOrder(id);
    if (!o || o.provider_id !== providerId || o.amount !== amount || o.currency.toUpperCase() !== currency.toUpperCase()) {
      throw new Error('Payment details do not match the order.');
    }
    if (o.status === 'paid' || o.status === 'refunded') {
      d.exec('COMMIT');
      return false;
    }
    if (!o.user_id) throw new Error('Account no longer exists; refund requires review.');
    d.prepare("UPDATE orders SET status='paid',paid_at=? WHERE id=?").run(new Date().toISOString(), id);
    ledger(o.user_id, o.credits, 'purchase', 'order:' + id, id);
    d.exec('COMMIT');
    return true;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

export function recordSubscription(
  userId: string,
  planId: string,
  provider: Provider,
  providerSubId: string,
  credits: number,
  amount: number,
  currency: string,
  interval = 'month',
  currentPeriodEnd?: string | null
): Subscription {
  const d = sqlite();
  const existing = d.prepare('SELECT * FROM subscriptions WHERE provider_subscription_id=?').get(providerSubId) as Subscription | undefined;
  const now = new Date().toISOString();
  if (existing) {
    d.prepare('UPDATE subscriptions SET status=?, updated_at=?, current_period_end=? WHERE id=?')
      .run('active', now, currentPeriodEnd || existing.current_period_end || null, existing.id);
    return d.prepare('SELECT * FROM subscriptions WHERE id=?').get(existing.id) as Subscription;
  }
  const id = crypto.randomUUID();
  d.prepare('INSERT INTO subscriptions (id,user_id,plan_id,provider,provider_subscription_id,status,credits_per_cycle,amount,currency,interval,current_period_end,cancel_at_period_end,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?,?)')
    .run(id, userId, planId, provider, providerSubId, 'active', credits, amount, currency, interval, currentPeriodEnd || null, now, now);
  return d.prepare('SELECT * FROM subscriptions WHERE id=?').get(id) as Subscription;
}

export function fulfillSubscriptionRenewal(subIdOrProviderSubId: string, credits: number, providerEventId: string) {
  const d = sqlite();
  d.exec('BEGIN IMMEDIATE');
  try {
    const sub = d.prepare('SELECT * FROM subscriptions WHERE id=? OR provider_subscription_id=?').get(subIdOrProviderSubId, subIdOrProviderSubId) as Subscription | undefined;
    if (!sub || !sub.user_id) return false;
    ledger(sub.user_id, credits || sub.credits_per_cycle, 'purchase', 'subscription_renewal:' + providerEventId);
    d.prepare("UPDATE subscriptions SET updated_at=? WHERE id=?").run(new Date().toISOString(), sub.id);
    d.exec('COMMIT');
    return true;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

export function recordRefund(id: string, totalRefunded: number) {
  const d = sqlite();
  d.exec('BEGIN IMMEDIATE');
  try {
    const o = getOrder(id);
    if (!o || !['paid', 'refunded'].includes(o.status) || totalRefunded < o.refunded_amount || totalRefunded > o.amount) {
      throw new Error('Invalid refund total.');
    }
    const revoke = Math.ceil(o.credits * totalRefunded / o.amount);
    const delta = revoke - o.revoked_credits;
    if (delta && o.user_id) ledger(o.user_id, -delta, 'refund', 'refund:' + id + ':' + totalRefunded, id);
    d.prepare("UPDATE orders SET refunded_amount=?,revoked_credits=?,status=? WHERE id=?").run(totalRefunded, revoke, totalRefunded === o.amount ? 'refunded' : 'paid', id);
    d.exec('COMMIT');
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}
