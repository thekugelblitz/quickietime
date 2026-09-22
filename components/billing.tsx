'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';

export type Pack = {
  id: string;
  name: string;
  description: string;
  credits: number;
  amount: number;
  currency: string;
  providers: string[];
  allowed_providers?: string | null;
  billing_type?: 'one_time' | 'recurring';
  billing_interval?: 'month' | 'year' | 'none';
};

type Order = {
  id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  credits: number;
  created_at: string;
  provider: string;
  billing_type?: string;
  refunded_amount: number;
  checkout_url?: string;
};

type SubscriptionItem = {
  id: string;
  plan_id: string;
  plan_name?: string;
  provider: string;
  provider_subscription_id: string;
  status: string;
  credits_per_cycle: number;
  amount: number;
  currency: string;
  interval: string;
  created_at: string;
  cancel_at_period_end: number;
};

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en', {style: 'currency', currency: currency || 'USD'}).format(amount / 100);

const providerLabels: Record<string, string> = {
  stripe: 'Stripe · Card, Apple Pay & Google Pay',
  paypal: 'PayPal · PayPal Balance & Cards',
  razorpay: 'Razorpay · UPI, Cards & NetBanking'
};

async function billing<T>(action: string, body?: unknown) {
  const r = await fetch('/api/billing/' + action, {
    method: body ? 'POST' : 'GET',
    headers: body ? {'Content-Type': 'application/json'} : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || 'Could not load billing.');
  return d as T;
}

export function CreditPacks({packs}: {packs: Pack[]}) {
  const [filter, setFilter] = useState<'all' | 'recurring' | 'one_time'>('all');
  const hasRecurring = packs.some(p => p.billing_type === 'recurring');
  const hasOneTime = packs.some(p => p.billing_type !== 'recurring');

  const filtered = packs.filter(p => {
    if (filter === 'recurring') return p.billing_type === 'recurring';
    if (filter === 'one_time') return p.billing_type !== 'recurring';
    return true;
  });

  return (
    <>
      <div className="paid-pack-heading">
        <span className="intro-kicker">PLANS & PACKAGES</span>
        <h2>Need a little extra?</h2>
        <p>Choose flexible one-time credit packs or recurring auto-refill subscriptions.</p>
        {hasRecurring && hasOneTime && (
          <div style={{display: 'inline-flex', gap: '8px', marginTop: '16px', background: 'var(--muted)', padding: '4px', borderRadius: '10px'}}>
            <button
              style={{padding: '7px 14px', borderRadius: '7px', border: 'none', background: filter === 'all' ? 'var(--panel)' : 'transparent', fontWeight: 600, fontSize: '13px'}}
              onClick={() => setFilter('all')}
            >
              All options
            </button>
            <button
              style={{padding: '7px 14px', borderRadius: '7px', border: 'none', background: filter === 'recurring' ? 'var(--panel)' : 'transparent', fontWeight: 600, fontSize: '13px'}}
              onClick={() => setFilter('recurring')}
            >
              Recurring subscriptions
            </button>
            <button
              style={{padding: '7px 14px', borderRadius: '7px', border: 'none', background: filter === 'one_time' ? 'var(--panel)' : 'transparent', fontWeight: 600, fontSize: '13px'}}
              onClick={() => setFilter('one_time')}
            >
              One-time packs
            </button>
          </div>
        )}
      </div>
      {filtered.length ? (
        <div className="pack-grid">
          {filtered.map(p => {
            const isRec = p.billing_type === 'recurring';
            const interval = p.billing_interval || 'month';
            return (
              <article className="pack-card" key={p.id}>
                <span className="category-pill" style={{background: isRec ? 'var(--lime)' : undefined, color: isRec ? '#20291a' : undefined}}>
                  {isRec ? `RECURRING (${interval.toUpperCase()})` : 'ONE-TIME PACK'}
                </span>
                <h3>{p.name}</h3>
                <strong className="checkout-price">
                  {money(p.amount, p.currency)}
                  {isRec && <small style={{fontSize: '15px', fontWeight: 400, color: 'var(--subtle)'}}> / {interval}</small>}
                </strong>
                <p>{p.description}</p>
                <b>{p.credits.toLocaleString()} generation credits</b>
                <ul>
                  <li>{isRec ? `Refills ${p.credits.toLocaleString()} credits every ${interval}` : 'Use after your free daily allowance'}</li>
                  <li>{isRec ? 'Cancel anytime in your account dashboard' : 'No expiry or automatic renewal'}</li>
                  <li>Supported payment methods: {p.providers.length ? p.providers.map(x => x === 'paypal' ? 'PayPal' : x === 'stripe' ? 'Stripe' : 'Razorpay').join(' • ') : 'Configuring'}</li>
                  <li>All six tools and account features included</li>
                </ul>
                <Link className="primary-button" href={'/checkout?plan=' + p.id}>
                  {isRec ? 'Subscribe to plan →' : 'Choose this pack →'}
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="admin-note">No credit packs are published yet. You can still use 20 free daily credits with an account.</p>
      )}
    </>
  );
}

export function Checkout() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [planId, setPlanId] = useState('');
  const [provider, setProvider] = useState('');
  const [coupon, setCoupon] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [orderId, setOrderId] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [requestKey, setRequestKey] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    queueMicrotask(() => {
      setPlanId(p.get('plan') || '');
      setOrderId(p.get('order') || '');
      setRequestKey(crypto.randomUUID());
    });
    void Promise.all([
      billing<{plans: Pack[]}>('plans'),
      fetch('/api/usage').then(r => r.json())
    ])
      .then(([b, u]) => {
        setPacks(b.plans);
        setSignedIn(u.authenticated);
        if (p.get('order') && u.authenticated) {
          return billing<{orders: Order[]}>('orders').then(x => {
            setOrder(x.orders.find(o => o.id === p.get('order')) || null);
          });
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setReady(true));
  }, []);

  const pack = packs.find(p => p.id === planId);
  const isRecurring = pack?.billing_type === 'recurring';
  const interval = pack?.billing_interval || 'month';

  async function pay() {
    if (!pack) return;
    setBusy(true);
    setError('');
    try {
      const selectedProvider = provider || pack.providers[0];
      const d = await billing<{url: string}>('checkout', {
        planId,
        provider: selectedProvider,
        coupon,
        requestKey
      });
      window.location.assign(d.url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError('');
    try {
      const d = await billing<{order: Order}>('verify', {id: orderId, capture: true});
      setOrder(d.order);
      if (d.order.status === 'pending') {
        setError('Payment has not been confirmed yet. Wait a moment, then check again.');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="checkout-card">
      {!ready ? (
        <p role="status">Loading checkout…</p>
      ) : !signedIn ? (
        <>
          <h2>Keep your credits in your account.</h2>
          <p>Sign in before purchasing so your credits reach the right place.</p>
          <Link className="primary-button" href={'/auth?return_to=' + encodeURIComponent('/checkout?' + (orderId ? 'order=' + orderId : 'plan=' + planId))}>
            Sign in to continue
          </Link>
        </>
      ) : orderId ? (
        <>
          <span className="category-pill">PAYMENT STATUS</span>
          <h2>
            {order?.status === 'paid'
              ? 'Your credits are ready.'
              : order?.status === 'refunded'
              ? 'This order was refunded.'
              : 'Confirm your payment'}
          </h2>
          <p>{order?.plan_name} · {order ? money(order.amount, order.currency) : orderId}</p>
          {order?.status === 'paid' ? (
            <>
              <p>{order.credits} credits have been activated for your account.</p>
              <Link className="primary-button" href="/">Start creating →</Link>
            </>
          ) : (
            <>
              <p>Returning here checks the payment confirmation status directly with your provider.</p>
              <button disabled={busy} className="primary-button" onClick={() => void verify()}>
                {busy ? 'Verifying with gateway…' : 'Verify / complete payment'}
              </button>
            </>
          )}
          <Link href="/billing">View billing history</Link>
        </>
      ) : pack ? (
        <>
          <span className="category-pill" style={{background: isRecurring ? 'var(--lime)' : undefined, color: isRecurring ? '#20291a' : undefined}}>
            {isRecurring ? `RECURRING SUBSCRIPTION (${interval.toUpperCase()})` : 'ONE-TIME PURCHASE'}
          </span>
          <h2>{pack.name}</h2>
          <strong className="checkout-price">
            {money(pack.amount, pack.currency)}
            {isRecurring && <small style={{fontSize: '16px', fontWeight: 400}}> / {interval}</small>}
          </strong>
          <p>
            {isRecurring
              ? `${pack.credits.toLocaleString()} credits auto-refilled every ${interval} · Cancel anytime in your dashboard`
              : `${pack.credits.toLocaleString()} credits · no expiry · no recurring charge`}
          </p>
          <p>{pack.description}</p>
          <label>
            Coupon code (optional)
            <input
              value={coupon}
              maxLength={32}
              onChange={e => {
                setCoupon(e.target.value.toUpperCase());
                setRequestKey(crypto.randomUUID());
              }}
              placeholder="Enter your coupon code"
            />
          </label>
          <label>
            Payment method
            <select
              value={provider || pack.providers[0] || ''}
              onChange={e => {
                setProvider(e.target.value);
                setRequestKey(crypto.randomUUID());
              }}
            >
              {pack.providers.map(p => (
                <option key={p} value={p}>
                  {providerLabels[p] || p}
                </option>
              ))}
            </select>
          </label>
          {!pack.providers.length && (
            <div className="error" style={{marginTop: '12px', padding: '14px', borderRadius: '8px'}}>
              <strong>No payment gateways available for this pack</strong>
              <p style={{marginTop: '4px'}}>
                Please ensure gateway credentials (PayPal or Stripe) are configured in the admin station (<strong>/bhai</strong>) and that PayPal is paired with a supported currency like USD.
              </p>
            </div>
          )}
          <p className="setting-hint">
            Your final total, including any coupon discount, is displayed on the secure provider page before checkout. Card and bank details are handled exclusively by your payment provider.
          </p>
          <button
            className="primary-button"
            disabled={busy || !pack.providers.length}
            onClick={() => void pay()}
          >
            {busy
              ? 'Opening secure checkout…'
              : isRecurring
              ? `Start ${interval} subscription →`
              : 'Continue to secure checkout →'}
          </button>
          <p className="setting-hint">
            Purchases follow our <Link href="/terms">terms</Link> and <Link href="/refund-policy">refund policy</Link>. Subscriptions can be canceled at any time before renewal.
          </p>
        </>
      ) : (
        <>
          <h2>Choose a credit pack first.</h2>
          <Link href="/pricing" className="primary-button">See plans & credits</Link>
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}

export function BillingHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = () => {
    void billing<{orders: Order[]; subscriptions?: SubscriptionItem[]}>('orders')
      .then(d => {
        setOrders(d.orders);
        setSubscriptions(d.subscriptions || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setReady(true));
  };

  useEffect(() => {
    load();
  }, []);

  async function cancel(subId: string) {
    if (!confirm('Are you sure you want to cancel this recurring subscription? You will keep your current credits.')) return;
    setCancelling(subId);
    setError('');
    setNotice('');
    try {
      await billing('cancel-subscription', {id: subId});
      setNotice('Subscription cancelled successfully.');
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCancelling(null);
    }
  }

  return (
    <>
      {error && <p role="alert" className="error">{error} <Link href="/auth?return_to=%2Fbilling">Sign in</Link></p>}
      {notice && <p role="status" className="admin-notice" style={{marginBottom: '16px'}}>{notice}</p>}
      <Link className="primary-button" href="/pricing">Get more credits</Link>

      {subscriptions.length > 0 && (
        <div style={{marginTop: '30px'}}>
          <h2>Active Recurring Subscriptions</h2>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Cycle & Price</th>
                  <th>Credits / Cycle</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(s => (
                  <tr key={s.id}>
                    <td>{s.plan_name || 'Writing Subscription'}<small>{s.provider.toUpperCase()} · ID: {s.provider_subscription_id}</small></td>
                    <td>{money(s.amount, s.currency)} / {s.interval}</td>
                    <td>{s.credits_per_cycle.toLocaleString()} credits</td>
                    <td><span className="category-pill">{s.status}</span></td>
                    <td>
                      {s.status === 'active' ? (
                        <button
                          disabled={cancelling === s.id}
                          onClick={() => void cancel(s.id)}
                          style={{color: '#c54267', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', fontSize: '13px'}}
                        >
                          {cancelling === s.id ? 'Cancelling…' : 'Cancel subscription'}
                        </button>
                      ) : (
                        <small>Cancelled</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{marginTop: '30px'}}>
        <h2>Payment Orders History</h2>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pack / Plan</th>
                <th>Total</th>
                <th>Status</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>
                    {o.plan_name}
                    <small>{new Date(o.created_at).toLocaleString()} · {o.provider}</small>
                  </td>
                  <td>
                    {money(o.amount, o.currency)}
                    {o.refunded_amount > 0 && <small>Refunded: {money(o.refunded_amount, o.currency)}</small>}
                  </td>
                  <td><span className="category-pill">{o.status}</span></td>
                  <td><Link href={'/checkout?order=' + o.id}>View order</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {ready && !orders.length && !subscriptions.length && !error && (
        <p style={{marginTop: '16px'}}>No purchases or active subscriptions yet. Your free daily allowance remains available.</p>
      )}
    </>
  );
}
