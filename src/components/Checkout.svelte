<script lang="ts">
  import { onMount } from 'svelte';
  import type { Pack } from '@/components/billing';

  let packs = $state<Pack[]>([]);
  let planId = $state('');
  let provider = $state('');
  let coupon = $state('');
  let order = $state<any>(null);
  let orderId = $state('');
  let signedIn = $state(false);
  let ready = $state(false);
  let busy = $state(false);
  let error = $state('');
  let requestKey = $state('');

  const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: currency || 'USD' }).format(amount / 100);

  onMount(async () => {
    const p = new URLSearchParams(window.location.search);
    planId = p.get('plan') || '';
    orderId = p.get('order') || '';
    requestKey = crypto.randomUUID();

    try {
      const [b, u] = await Promise.all([
        fetch('/api/billing/plans').then((r) => r.json()),
        fetch('/api/usage').then((r) => r.json()),
      ]);
      packs = b.plans || [];
      signedIn = u.authenticated;

      if (orderId && u.authenticated) {
        const ordData = await fetch('/api/billing/orders').then((r) => r.json());
        order = ordData.orders?.find((o: any) => o.id === orderId) || null;
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      ready = true;
    }
  });

  const pack = $derived(packs.find((p) => p.id === planId));
  const isRecurring = $derived(pack?.billing_type === 'recurring');
  const interval = $derived(pack?.billing_interval || 'month');

  async function pay() {
    if (!pack) return;
    busy = true;
    error = '';
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          provider: provider || pack.providers[0] || 'stripe',
          coupon,
          requestKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Checkout failed');
      window.location.assign(data.url);
    } catch (e) {
      error = (e as Error).message;
      busy = false;
    }
  }

  async function verify() {
    busy = true;
    error = '';
    try {
      const res = await fetch('/api/billing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, capture: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Verification failed');
      order = data.order;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<section class="checkout-card">
  {#if !ready}
    <p role="status">Loading checkout…</p>
  {:else if !signedIn}
    <h2>Keep your credits in your account.</h2>
    <p>Sign in before purchasing so your credits reach the right place.</p>
    <a
      class="primary-button w-full justify-center"
      href={`/auth?return_to=${encodeURIComponent('/checkout?' + (orderId ? 'order=' + orderId : 'plan=' + planId))}`}
    >
      Sign in to continue
    </a>
  {:else if orderId}
    <span class="category-pill">PAYMENT STATUS</span>
    <h2>
      {order?.status === 'paid'
        ? 'Your credits are ready.'
        : order?.status === 'refunded'
          ? 'This order was refunded.'
          : 'Confirm your payment'}
    </h2>
    <p>{order?.plan_name} · {order ? money(order.amount, order.currency) : orderId}</p>
    {#if order?.status === 'paid'}
      <p>{order.credits} credits have been activated for your account.</p>
      <a class="primary-button w-full justify-center" href="/">Start creating →</a>
    {:else}
      <p>Returning here checks the payment confirmation status directly with your provider.</p>
      {#if error}
        <p role="alert" class="error">{error}</p>
      {/if}
      <button type="button" class="primary-button w-full justify-center" disabled={busy} onclick={verify}>
        {busy ? 'Verifying payment…' : 'Verify payment now'}
      </button>
    {/if}
  {:else if pack}
    <span class="category-pill">
      {isRecurring ? `RECURRING (${interval.toUpperCase()})` : 'ONE-TIME PACK'}
    </span>
    <h2>{pack.name}</h2>
    <div class="checkout-price">
      {money(pack.amount, pack.currency)}
      {#if isRecurring}
        <small style="font-size: 16px; font-weight: 400; color: var(--subtle);"> / {interval}</small>
      {/if}
    </div>
    <p>{pack.description}</p>
    <p><strong>{pack.credits.toLocaleString()} generation credits</strong></p>

    <label>
      Coupon code (optional)
      <input
        type="text"
        placeholder="SAVE10"
        bind:value={coupon}
        class="uppercase"
        maxlength="32"
      />
    </label>

    <label>
      Payment method
      <select bind:value={provider}>
        {#each pack.providers as p}
          <option value={p}>
            {p === 'paypal' ? 'PayPal' : p === 'stripe' ? 'Stripe (Cards, Apple Pay)' : 'Razorpay (UPI, NetBanking)'}
          </option>
        {/each}
      </select>
    </label>

    {#if error}
      <p role="alert" class="error">{error}</p>
    {/if}

    <button type="button" class="primary-button w-full justify-center" disabled={busy} onclick={pay}>
      {busy ? 'Connecting to payment provider…' : `Pay ${money(pack.amount, pack.currency)}`}
    </button>
  {:else}
    <p>Please select a plan from our <a href="/pricing">pricing page</a>.</p>
  {/if}
</section>
