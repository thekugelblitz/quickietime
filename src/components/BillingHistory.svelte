<script lang="ts">
  import { onMount } from 'svelte';

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
    new Intl.NumberFormat('en', { style: 'currency', currency: currency || 'USD' }).format(amount / 100);

  let orders = $state<Order[]>([]);
  let subscriptions = $state<SubscriptionItem[]>([]);
  let error = $state('');
  let notice = $state('');
  let ready = $state(false);
  let cancelling = $state<string | null>(null);

  async function billing<T>(action: string, body?: unknown) {
    const r = await fetch('/api/billing/' + action, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || 'Could not load billing.');
    return d as T;
  }

  function load() {
    billing<{ orders: Order[]; subscriptions?: SubscriptionItem[] }>('orders')
      .then(d => {
        orders = d.orders || [];
        subscriptions = d.subscriptions || [];
      })
      .catch(e => {
        error = e.message;
      })
      .finally(() => {
        ready = true;
      });
  }

  onMount(() => {
    load();
  });

  async function cancel(subId: string) {
    if (!confirm('Are you sure you want to cancel this recurring subscription? You will keep your current credits.')) return;
    cancelling = subId;
    error = '';
    notice = '';
    try {
      await billing('cancel-subscription', { id: subId });
      notice = 'Subscription cancelled successfully.';
      load();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      cancelling = null;
    }
  }
</script>

{#if error}
  <p role="alert" class="error">{error} <a href="/auth?return_to=%2Fbilling">Sign in</a></p>
{/if}

{#if notice}
  <p role="status" class="admin-notice" style="margin-bottom: 16px;">{notice}</p>
{/if}

<a class="primary-button inline-flex items-center" href="/pricing">Get more credits</a>

{#if subscriptions.length > 0}
  <div style="margin-top: 30px;">
    <h2>Active Recurring Subscriptions</h2>
    <div class="admin-table-wrap">
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
          {#each subscriptions as s (s.id)}
            <tr>
              <td>
                {s.plan_name || 'Writing Subscription'}
                <small>{s.provider.toUpperCase()} · ID: {s.provider_subscription_id}</small>
              </td>
              <td>{money(s.amount, s.currency)} / {s.interval}</td>
              <td>{s.credits_per_cycle.toLocaleString()} credits</td>
              <td><span class="category-pill">{s.status}</span></td>
              <td>
                {#if s.status === 'active'}
                  <button
                    disabled={cancelling === s.id}
                    onclick={() => void cancel(s.id)}
                    style="color: #c54267; background: transparent; border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px; font-size: 13px;"
                  >
                    {cancelling === s.id ? 'Cancelling…' : 'Cancel subscription'}
                  </button>
                {:else}
                  <small>Cancelled</small>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<div style="margin-top: 30px;">
  <h2>Payment Orders History</h2>
  <div class="admin-table-wrap">
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
        {#each orders as o (o.id)}
          <tr>
            <td>
              {o.plan_name}
              <small>{new Date(o.created_at).toLocaleString()} · {o.provider}</small>
            </td>
            <td>
              {money(o.amount, o.currency)}
              {#if o.refunded_amount > 0}
                <small>Refunded: {money(o.refunded_amount, o.currency)}</small>
              {/if}
            </td>
            <td><span class="category-pill">{o.status}</span></td>
            <td><a href={'/checkout?order=' + o.id}>View order</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#if ready && !orders.length && !subscriptions.length && !error}
  <p style="margin-top: 16px;">No purchases or active subscriptions yet. Your free daily allowance remains available.</p>
{/if}
