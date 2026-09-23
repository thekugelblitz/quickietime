<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Zap,
    LayoutDashboard,
    Users as UsersIcon,
    FileText,
    Package as PackageIcon,
    Ticket,
    Settings as SettingsIcon,
    Receipt,
    Shield,
    LogOut,
    ArrowUpRight,
    X
  } from 'lucide-svelte';

  type Item = {
    id: string;
    email?: string;
    created_at?: string;
    name?: string;
    description?: string;
    credits?: number;
    amount?: number;
    currency?: string;
    active?: number;
    code?: string;
    percent?: number;
    max_uses?: number;
    expires_at?: string;
    claimed?: number;
    balance?: number;
    suspended?: number;
    generations?: number;
    status?: string;
    plan_name?: string;
    plan_id?: string;
    provider?: string;
    refunded_amount?: number;
    action?: string;
    target?: string;
    allowed_providers?: string;
    billing_type?: string;
    billing_interval?: string;
    paypal_plan_id?: string;
    stripe_price_id?: string;
    interval?: string;
    credits_per_cycle?: number;
    provider_subscription_id?: string;
    user_id?: string;
    entry?: { brief: { idea: string; tool: string }; results: { text: string }[] };
  };

  type Metrics = {
    days: number;
    users: number;
    pendingOrders: number;
    generations: {
      requests: number;
      successes: number;
      ai_cost_usd: number;
      input_tokens: number;
      output_tokens: number;
      estimated_requests: number;
      latency_ms: number;
    };
    revenue: { currency: string; revenue: number; orders: number }[];
    series: { day: string; requests: number; successes: number; cost: number }[];
    costs: { input: number; output: number; fixed: number; feePercent: number; usdInr: number };
  };

  let admin = $state<{ email: string } | null>(null);
  let ready = $state(false);
  let section = $state('metrics');
  let items = $state<Item[]>([]);
  let metrics = $state<Metrics | null>(null);
  let settings = $state<Record<string, string | { configured: boolean }>>({});
  let changes = $state<Record<string, string>>({});
  let error = $state('');
  let notice = $state('');
  let busy = $state(false);
  let loading = $state(false);
  let page = $state(0);
  let query = $state('');
  let days = $state('30');
  let edit = $state<Item | null>(null);
  let dialog = $state('');

  const sections = [
    { key: 'metrics', label: 'Overview', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: UsersIcon },
    { key: 'generations', label: 'Generations', icon: FileText },
    { key: 'orders', label: 'Orders', icon: Receipt },
    { key: 'subscriptions', label: 'Subscriptions', icon: Receipt },
    { key: 'plans', label: 'Credit packs', icon: PackageIcon },
    { key: 'coupons', label: 'Coupons', icon: Ticket },
    { key: 'settings', label: 'Connections & costs', icon: SettingsIcon },
    { key: 'audit', label: 'Audit trail', icon: Shield }
  ] as const;

  const groups: Record<string, string[]> = {
    'AI connection': ['AI_PROVIDER', 'AI_MODEL', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'CHEAPERINFERENCE_API_KEY'],
    'Email delivery': ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'],
    'Google Sign-In': ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    'Stripe': ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    'PayPal': ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_WEBHOOK_ID', 'PAYPAL_MODE'],
    'Razorpay': ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'],
    'Cost model (USD)': ['INPUT_COST_PER_MILLION', 'OUTPUT_COST_PER_MILLION', 'MONTHLY_FIXED_COST_USD', 'PAYMENT_FEE_PERCENT', 'USD_INR_RATE']
  };

  const labels: Record<string, string> = {
    GOOGLE_CLIENT_ID: 'Google Client ID',
    GOOGLE_CLIENT_SECRET: 'Google Client Secret',
    INPUT_COST_PER_MILLION: 'Input cost / 1M tokens (USD)',
    OUTPUT_COST_PER_MILLION: 'Output cost / 1M tokens (USD)',
    MONTHLY_FIXED_COST_USD: 'Monthly hosting & overhead (USD)',
    PAYMENT_FEE_PERCENT: 'Estimated payment fee (%)',
    USD_INR_RATE: 'INR per USD (for reporting only)'
  };

  async function api<T>(action: string, body?: unknown): Promise<T> {
    const r = await fetch('/api/admin/' + action, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await r.text();
    let d: { error?: { message?: string } } | null = null;
    if (text) {
      try {
        d = JSON.parse(text) as { error?: { message?: string } };
      } catch {}
    }
    if (!r.ok) {
      throw new Error(d?.error?.message || (text && text.length < 200 ? text : `Request failed (${r.status})`));
    }
    return d as unknown as T;
  }

  async function loadData() {
    if (!admin) return;
    loading = true;
    error = '';
    try {
      if (section === 'settings') {
        const d = await api<{ settings: typeof settings }>('settings');
        settings = d.settings;
        changes = {};
      } else if (section === 'metrics') {
        metrics = await api<Metrics>('metrics?days=' + days);
      } else {
        const d = await api<{ items: Item[] }>(section + '?page=' + page + '&q=' + encodeURIComponent(query));
        items = d.items;
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    void api<{ admin: { email: string } | null }>('session')
      .then(d => {
        admin = d.admin;
      })
      .catch(e => {
        error = e.message;
      })
      .finally(() => {
        ready = true;
      });
  });

  $effect(() => {
    if (admin && section) {
      const _p = page;
      const _q = query;
      const _d = days;
      const t = setTimeout(() => void loadData(), 150);
      return () => clearTimeout(t);
    }
  });

  async function mutate(action: string, body: unknown) {
    busy = true;
    error = '';
    notice = '';
    try {
      await api(action, body);
      dialog = '';
      notice = 'Saved.';
      await loadData();
      return true;
    } catch (e) {
      error = (e as Error).message;
      return false;
    } finally {
      busy = false;
    }
  }

  async function login(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const f = new FormData(form);
    busy = true;
    error = '';
    try {
      await api('login', Object.fromEntries(f));
      const d = await api<{ admin: { email: string } }>('session');
      admin = d.admin;
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }

  function openModal(kind: string, item: Item = { id: '' }) {
    edit = item;
    dialog = kind;
    error = '';
  }

  const money = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  let overviewComputed = $derived.by(() => {
    if (!metrics) return null;
    const g = metrics.generations;
    const canConvert = metrics.costs.usdInr > 0 || !metrics.revenue.some(r => r.currency === 'INR');
    const revenue = metrics.revenue.reduce(
      (n, r) => n + (r.currency === 'USD' ? r.revenue : r.revenue / (metrics?.costs.usdInr || 1)),
      0
    );
    const fees = (revenue * metrics.costs.feePercent) / 100;
    const totalCost = g.ai_cost_usd + metrics.costs.fixed + fees;
    const profit = revenue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : null;
    const maxRequests = Math.max(...metrics.series.map(x => x.requests), 1);
    return { g, canConvert, revenue, fees, totalCost, profit, roi, maxRequests };
  });
</script>

{#if !ready}
  <main class="admin-login">
    <p role="status">Opening control station…</p>
  </main>
{:else if !admin}
  <main class="admin-login">
    <a href="/" class="brand">ϟ QuickieTime</a>
    <span class="intro-kicker">CONTROL STATION / BHAI</span>
    <h1>Welcome back, boss.</h1>
    <p>A separate, protected space to run QuickieTime.</p>
    <form method="post" action="/bhai" onsubmit={login}>
      <label>
        Username or email
        <input required name="email" type="text" autocomplete="username" />
      </label>
      <label>
        Password
        <input required name="password" type="password" minlength={6} maxlength={128} autocomplete="current-password" />
      </label>
      <small>Customer accounts cannot access this station.</small>
      {#if error}
        <p role="alert" class="error">{error}</p>
      {/if}
      <button type="submit" class="primary-button" disabled={busy}>
        {busy ? 'Checking…' : 'Sign in securely'}
      </button>
    </form>
  </main>
{:else}
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <a href="/" class="brand">
        <Zap fill="currentColor" size={20} /> QuickieTime
      </a>
      <span class="admin-eyebrow">CONTROL STATION</span>
      <nav aria-label="Admin sections">
        {#each sections as s}
          {@const Icon = s.icon}
          <button
            aria-current={section === s.key ? 'page' : undefined}
            onclick={() => {
              section = s.key;
              page = 0;
              query = '';
              notice = '';
            }}
          >
            <Icon size={18} />
            {s.label}
          </button>
        {/each}
      </nav>
      <div class="admin-profile">
        <small>{admin.email}</small>
        <button onclick={() => openModal('password')}>Change password</button>
        <button
          onclick={async () => {
            try {
              await api('logout', {});
              admin = null;
            } catch (e) {
              error = (e as Error).message;
            }
          }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-top">
        <div>
          <span class="intro-kicker">YOUR BUSINESS, IN FOCUS</span>
          <h1>{sections.find(s => s.key === section)?.label}</h1>
        </div>
        <a href="/" target="_blank" rel="noreferrer">
          Open website <ArrowUpRight size={16} />
        </a>
      </header>

      {#if error}
        <p role="alert" class="error">{error}</p>
      {/if}
      {#if notice}
        <p role="status" class="admin-notice">{notice}</p>
      {/if}
      {#if loading}
        <p role="status">Loading current data…</p>
      {/if}

      {#if section === 'metrics'}
        <div class="admin-toolbar">
          <label>
            Reporting period
            <select bind:value={days}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </label>
          <button onclick={() => void loadData()}>Refresh</button>
        </div>

        {#if metrics && overviewComputed}
          <div class="admin-kpis">
            <article>
              <span>Accounts</span>
              <strong>{metrics.users}</strong>
              <small>All registered users</small>
            </article>
            <article>
              <span>AI requests</span>
              <strong>{overviewComputed.g.requests || 0}</strong>
              <small>{overviewComputed.g.successes || 0} succeeded</small>
            </article>
            <article>
              <span>Net revenue</span>
              <strong>{overviewComputed.canConvert ? money(overviewComputed.revenue) : 'Set exchange rate'}</strong>
              <small>Paid less recorded refunds</small>
            </article>
            <article>
              <span>Estimated profit</span>
              <strong>{overviewComputed.canConvert ? money(overviewComputed.profit) : '—'}</strong>
              <small>After configured costs</small>
            </article>
          </div>

          <div class="admin-overview-grid">
            <section class="admin-panel">
              <div class="section-title">
                <h2>Words in motion</h2>
                <span>{metrics.days} days</span>
              </div>
              <div class="usage-bars" role="img" aria-label="Daily AI requests">
                {#if metrics.series.length}
                  {#each metrics.series as s (s.day)}
                    <div title={`${s.day}: ${s.requests} requests`}>
                      <span style="height: {Math.max(4, (s.requests / overviewComputed.maxRequests) * 140)}px;" />
                      <small>{s.day.slice(5)}</small>
                    </div>
                  {/each}
                {:else}
                  <p>Your first generation will start this chart.</p>
                {/if}
              </div>
              <p>{Math.round(overviewComputed.g.latency_ms / 1000)}s average request time · {metrics.pendingOrders} pending orders</p>
            </section>

            <section class="admin-panel">
              <h2>Your cost model</h2>
              <dl>
                <div>
                  <dt>AI usage</dt>
                  <dd>{money(overviewComputed.g.ai_cost_usd)}</dd>
                </div>
                <div>
                  <dt>Fixed overhead (prorated)</dt>
                  <dd>{money(metrics.costs.fixed)}</dd>
                </div>
                <div>
                  <dt>Estimated gateway fees</dt>
                  <dd>{overviewComputed.canConvert ? money(overviewComputed.fees) : '—'}</dd>
                </div>
                <div>
                  <dt>Estimated ROI</dt>
                  <dd>{overviewComputed.canConvert && overviewComputed.roi !== null ? overviewComputed.roi.toFixed(1) + '%' : 'Not enough cost data'}</dd>
                </div>
              </dl>
              <p>ROI = (net revenue − costs) ÷ costs. Token costs are recorded at the rates active for each request. Fees and overhead are estimates, not accounting statements.</p>
            </section>
          </div>

          <div class="admin-panel">
            <h2>Usage & reporting notes</h2>
            <p>{overviewComputed.g.input_tokens.toLocaleString()} input tokens · {overviewComputed.g.output_tokens.toLocaleString()} output tokens · {overviewComputed.g.estimated_requests} requests have estimated or unavailable token counts.</p>
            {#if metrics.costs.input === 0 && metrics.costs.output === 0}
              <p>AI rates are zero. Enter your provider’s actual rates in Connections & costs before interpreting profit.</p>
            {/if}
            <p>Metrics begin with this release. Historical generations without usage records are not retroactively assigned a cost. Payments are grouped by their paid date; later refunds update that order’s net revenue.</p>
            {#each metrics.revenue as r}
              <p>{r.currency}: {r.revenue.toFixed(2)} across {r.orders} orders</p>
            {/each}
          </div>
        {/if}
      {:else if section === 'settings'}
        <form onsubmit={(e) => { e.preventDefault(); void mutate('settings', changes); }}>
          <p class="admin-note">
            Secrets are encrypted in the database and never shown again. Leave a secret blank to keep it. Changes apply to new requests immediately. Keep previous gateway credentials available until pending orders are settled.
          </p>
          <div class="admin-form-grid">
            {#each Object.entries(groups) as [title, keys]}
              <fieldset>
                <legend>{title}</legend>
                {#each keys as key}
                  {@const old = settings[key]}
                  {@const hidden = typeof old === 'object'}
                  {@const val = changes[key] ?? (typeof old === 'string' ? old : '')}
                  <label>
                    {labels[key] || key.replaceAll('_', ' ')}
                    {#if ['AI_PROVIDER', 'PAYPAL_MODE'].includes(key)}
                      <select
                        value={val || (key === 'AI_PROVIDER' ? 'cheaperinference' : 'sandbox')}
                        onchange={(e) => { changes[key] = (e.currentTarget as HTMLSelectElement).value; }}
                      >
                        {#each (key === 'AI_PROVIDER' ? ['cheaperinference', 'openai', 'openrouter'] : ['sandbox', 'live']) as v}
                          <option value={v}>{v}</option>
                        {/each}
                      </select>
                    {:else}
                      <input
                        value={val}
                        type={hidden ? 'password' : 'text'}
                        autocomplete="off"
                        placeholder={hidden && old.configured ? 'Configured · leave blank to keep' : 'Not configured'}
                        oninput={(e) => { changes[key] = (e.currentTarget as HTMLInputElement).value; }}
                      />
                    {/if}
                  </label>
                {/each}
                {#if ['Stripe', 'PayPal', 'Razorpay'].includes(title)}
                  <p class="setting-hint">
                    Webhook URL: https://qtai.click/api/webhooks/{title.toLowerCase()}<br />
                    Enable payment confirmation events in the provider dashboard. Test before using live credentials.
                  </p>
                {/if}
                {#if title === 'Google Sign-In'}
                  <p class="setting-hint">
                    Authorized JavaScript Origin: https://qtai.click<br />
                    Authorized Redirect URI: https://qtai.click/api/auth/callback/google<br />
                    Create an OAuth 2.0 Web Application client in Google Cloud Console.
                  </p>
                {/if}
              </fieldset>
            {/each}
          </div>
          <button class="primary-button" disabled={busy || !Object.keys(changes).length}>
            Save settings
          </button>
          <p class="setting-hint">
            AI costs use your configured rates at request time. Estimates exclude taxes and fees beyond the percentage you enter. Set rates before launch for useful ROI.
          </p>
        </form>
      {:else}
        <div class="admin-toolbar">
          {#if ['users', 'generations', 'orders', 'subscriptions'].includes(section)}
            <label>
              Search
              <input
                bind:value={query}
                oninput={() => { page = 0; }}
                placeholder={section === 'generations' ? 'Input, output or email' : 'Email or order ID'}
              />
            </label>
          {/if}
          {#if section === 'plans'}
            <button class="primary-button" onclick={() => openModal('plans')}>Create credit pack</button>
          {/if}
          {#if section === 'coupons'}
            <button class="primary-button" onclick={() => openModal('coupons')}>Create coupon</button>
          {/if}
          <button onclick={() => void loadData()}>Refresh</button>
        </div>

        {#if section === 'plans'}
          <p class="admin-note">
            Credit packs & subscriptions. Paid credits do not expire; the daily free allowance is used first. Recurring packs recharge credits on every cycle. Configured gateways appear at checkout.
          </p>
        {:else if section === 'subscriptions'}
          <p class="admin-note">
            Active customer recurring subscriptions. Renewals automatically credit wallets via Stripe and PayPal webhooks.
          </p>
        {:else if section === 'coupons'}
          <p class="admin-note">
            Percentage discounts, one claim per account. Pending checkout attempts reserve a claim. This prevents overselling a limited coupon; increase its cap only after reviewing pending orders.
          </p>
        {/if}

        {#if section === 'generations'}
          <div class="admin-records">
            {#each items.slice(0, 25) as i (i.id)}
              <article>
                <div>
                  <strong>{i.entry?.brief.tool}</strong>
                  <small>{i.email} · {i.created_at && new Date(i.created_at).toLocaleString()}</small>
                </div>
                <details>
                  <summary>View input and generated text</summary>
                  <h3>Input</h3>
                  <p class="content-output">{i.entry?.brief.idea}</p>
                  <h3>Output</h3>
                  {#each i.entry?.results || [] as r, n}
                    <p class="content-output">{r.text}</p>
                  {/each}
                </details>
              </article>
            {/each}
          </div>
        {:else}
          <div class="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  {#if section === 'users'}
                    <th>User</th><th>Credits</th><th>Generations</th><th>Status</th><th>Actions</th>
                  {:else if section === 'plans'}
                    <th>Pack</th><th>Billing Type</th><th>Price</th><th>Credits</th><th>Allowed Gateways</th><th>Status</th><th>Actions</th>
                  {:else if section === 'subscriptions'}
                    <th>Subscriber</th><th>Plan</th><th>Provider</th><th>Cycle Details</th><th>Status</th><th>Subscription ID</th>
                  {:else if section === 'coupons'}
                    <th>Code</th><th>Discount</th><th>Claims</th><th>Expires</th><th>Actions</th>
                  {:else if section === 'orders'}
                    <th>Order / user</th><th>Pack</th><th>Amount</th><th>Status</th><th>Actions</th>
                  {:else}
                    <th>Time</th><th>Action</th><th>Target</th>
                  {/if}
                </tr>
              </thead>
              <tbody>
                {#each items.slice(0, ['plans', 'coupons'].includes(section) ? items.length : 25) as i (i.id || i.code)}
                  <tr>
                    {#if section === 'users'}
                      <td>{i.email}<small>{i.id}</small></td>
                      <td>{i.balance}</td>
                      <td>{i.generations}</td>
                      <td>{i.suspended ? 'Suspended' : 'Active'}</td>
                      <td><button onclick={() => openModal('users', i)}>Manage</button></td>
                    {:else if section === 'plans'}
                      <td>{i.name}<small>{i.description}</small></td>
                      <td>
                        <span class="category-pill">
                          {i.billing_type === 'recurring' ? 'RECURRING (' + (i.billing_interval || 'month').toUpperCase() + ')' : 'ONE-TIME'}
                        </span>
                      </td>
                      <td>{i.currency} {((i.amount || 0) / 100).toFixed(2)}</td>
                      <td>{i.credits}</td>
                      <td><small>{(i.allowed_providers || 'all configured').split(',').join(' • ')}</small></td>
                      <td>{i.active ? 'Published' : 'Draft / hidden'}</td>
                      <td><button onclick={() => openModal('plans', i)}>Edit</button></td>
                    {:else if section === 'subscriptions'}
                      <td>{i.email || 'Customer'}<small>{i.user_id}</small></td>
                      <td>{i.plan_name || i.plan_id}</td>
                      <td>{i.provider}</td>
                      <td>{i.credits_per_cycle} credits / {i.interval} · {i.currency} {((i.amount || 0) / 100).toFixed(2)}</td>
                      <td><span class="category-pill">{i.status}</span></td>
                      <td><small>{i.provider_subscription_id}</small></td>
                    {:else if section === 'coupons'}
                      <td>{i.code}</td>
                      <td>{i.percent}%</td>
                      <td>{i.claimed} / {i.max_uses}</td>
                      <td>{i.expires_at?.slice(0, 10)} · {i.active ? 'Active' : 'Disabled'}</td>
                      <td><button onclick={() => openModal('coupons', i)}>Edit</button></td>
                    {:else if section === 'orders'}
                      <td>{i.id}<small>{i.email || 'Deleted account'} · {i.provider}</small></td>
                      <td>{i.plan_name}</td>
                      <td>
                        {i.currency} {((i.amount || 0) / 100).toFixed(2)}
                        {#if (i.refunded_amount || 0) > 0}
                          <small>Refunded: {((i.refunded_amount || 0) / 100).toFixed(2)}</small>
                        {/if}
                      </td>
                      <td>{i.status}</td>
                      <td>
                        <button disabled={busy} onclick={() => void mutate('reconcile', { id: i.id })}>
                          Verify payment
                        </button>
                        {#if i.status === 'paid'}
                          <button onclick={() => openModal('refund', i)}>Record refund</button>
                        {/if}
                      </td>
                    {:else}
                      <td>{i.created_at}</td>
                      <td>{i.action}</td>
                      <td>{i.target}</td>
                    {/if}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        {#if !items.length && !loading}
          <div class="admin-empty">
            <h2>Nothing here yet.</h2>
            <p>
              {section === 'plans'
                ? 'Create your first credit pack when your pricing is ready.'
                : section === 'subscriptions'
                ? 'Active recurring subscriptions will appear here.'
                : 'Real activity will appear here as your site is used.'}
            </p>
          </div>
        {/if}

        {#if !['plans', 'coupons'].includes(section)}
          <div class="admin-toolbar">
            <button disabled={!page || loading} onclick={() => { page = Math.max(0, page - 1); }}>
              Previous
            </button>
            <span>Page {page + 1}</span>
            <button disabled={items.length <= 25 || loading} onclick={() => { page = page + 1; }}>
              Next
            </button>
          </div>
        {/if}
      {/if}
    </main>
  </div>
{/if}

{#if dialog}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div class="admin-dialog bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">
          {dialog === 'plans'
            ? 'Credit pack / Subscription'
            : dialog === 'coupons'
            ? 'Coupon'
            : dialog === 'users'
            ? 'Manage user'
            : dialog === 'refund'
            ? 'Record a provider refund'
            : 'Change admin password'}
        </h2>
        <button
          onclick={() => { dialog = ''; }}
          class="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--subtle)] transition"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>

      {#if error}
        <p class="error mb-4" role="alert">{error}</p>
      {/if}

      <form
        onsubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          const f = Object.fromEntries(fd);
          let body: unknown = f;

          if (dialog === 'plans') {
            const allowed = [
              f.allow_stripe === 'on' ? 'stripe' : null,
              f.allow_paypal === 'on' ? 'paypal' : null,
              f.allow_razorpay === 'on' ? 'razorpay' : null
            ].filter(Boolean).join(',');
            body = {
              ...f,
              id: edit?.id || undefined,
              credits: Number(f.credits),
              amount: Math.round(Number(f.amount) * 100),
              active: f.active === 'on',
              allowed_providers: allowed || null,
              billing_type: f.billing_type || 'one_time',
              billing_interval: f.billing_interval || 'month'
            };
          } else if (dialog === 'coupons') {
            body = {
              ...f,
              percent: Number(f.percent),
              max_uses: Number(f.max_uses),
              active: f.active === 'on',
              expires_at: new Date(String(f.expires_at) + 'T23:59:59Z').toISOString()
            };
          } else if (dialog === 'users') {
            body = {
              id: edit?.id,
              credits: Number(f.credits),
              suspended: f.suspended === 'on',
              reason: f.reason
            };
          } else if (dialog === 'refund') {
            body = {
              id: edit?.id,
              amount: Math.round(Number(f.amount) * 100),
              reference: f.reference,
              confirm: f.confirm
            };
          }

          const ok = await mutate(dialog, body);
          if (ok && dialog === 'password') {
            admin = null;
          }
        }}
      >
        {#if dialog === 'plans'}
          <label>
            Name
            <input name="name" required maxlength={80} value={edit?.name || ''} />
          </label>
          <label>
            Description
            <textarea name="description" maxlength={400} value={edit?.description || ''}></textarea>
          </label>
          <div class="form-pair">
            <label>
              Price
              <input name="amount" type="number" min="0.01" step="0.01" required value={((edit?.amount || 100) / 100).toString()} />
            </label>
            <label>
              Currency
              <select name="currency" value={edit?.currency || 'USD'}>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
              </select>
            </label>
          </div>
          <div class="form-pair">
            <label>
              Billing type
              <select name="billing_type" value={edit?.billing_type || 'one_time'}>
                <option value="one_time">One-time purchase (no auto-renewal)</option>
                <option value="recurring">Recurring subscription (auto-renew)</option>
              </select>
            </label>
            <label>
              Billing interval
              <select name="billing_interval" value={edit?.billing_interval || 'month'}>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </label>
          </div>
          <label>
            Allowed payment methods for this pack:
            <div style="display: flex; gap: 18px; margin-top: 6px; flex-wrap: wrap;">
              <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px;">
                <input type="checkbox" name="allow_stripe" checked={!edit?.allowed_providers || edit?.allowed_providers.includes('stripe')} /> Stripe
              </label>
              <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px;">
                <input type="checkbox" name="allow_paypal" checked={!edit?.allowed_providers || edit?.allowed_providers.includes('paypal')} /> PayPal
              </label>
              <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px;">
                <input type="checkbox" name="allow_razorpay" checked={!edit?.allowed_providers || edit?.allowed_providers.includes('razorpay')} /> Razorpay
              </label>
            </div>
            <small style="display: block; margin-top: 4px; color: var(--subtle);">
              Note: PayPal supports USD and global currencies. Unchecked methods will be hidden at checkout.
            </small>
          </label>
          <label>
            Credits per cycle / pack
            <input name="credits" type="number" required min="1" max="1000000" value={edit?.credits || 100} />
          </label>
          <label class="check-label">
            <input name="active" type="checkbox" checked={edit ? !!edit.active : true} /> Publish on pricing page
          </label>
        {/if}

        {#if dialog === 'coupons'}
          <label>
            Code
            <input name="code" required pattern="[A-Z0-9_-]{3,32}" value={edit?.code || ''} readonly={!!edit?.code} />
          </label>
          <label>
            Discount (%)
            <input name="percent" type="number" min="1" max="90" required value={edit?.percent || 10} />
          </label>
          <label>
            Maximum claims
            <input name="max_uses" type="number" min="1" required value={edit?.max_uses || 100} />
          </label>
          <label>
            Expires (UTC)
            <input type="date" name="expires_at" required value={edit?.expires_at?.slice(0, 10) || ''} />
          </label>
          <label class="check-label">
            <input type="checkbox" name="active" checked={edit?.active !== 0} /> Active
          </label>
        {/if}

        {#if dialog === 'users'}
          <p>{edit?.email}</p>
          <label>
            Credit adjustment (+ grant / − deduct)
            <input name="credits" type="number" value="0" min="-1000000" max="1000000" />
          </label>
          <label>
            Reason
            <input name="reason" required minlength={5} maxlength={300} />
          </label>
          <label class="check-label">
            <input name="suspended" type="checkbox" checked={!!edit?.suspended} /> Suspend access and revoke sessions
          </label>
        {/if}

        {#if dialog === 'refund'}
          <p>
            Issue the refund in {edit?.provider} first. This action records it locally and removes the corresponding credits; it does not send money.
          </p>
          <label>
            Total refunded so far ({edit?.currency})
            <input type="number" name="amount" min="0.01" step="0.01" max={(edit?.amount || 0) / 100} required />
          </label>
          <label>
            Provider refund reference
            <input name="reference" required minlength={5} />
          </label>
          <label>
            Type REFUND RECORDED AT PROVIDER
            <input name="confirm" required pattern="REFUND RECORDED AT PROVIDER" />
          </label>
        {/if}

        {#if dialog === 'password'}
          <label>
            Current password
            <input name="current" type="password" required autocomplete="current-password" />
          </label>
          <label>
            New password
            <input name="next" type="password" required minlength={12} maxlength={128} autocomplete="new-password" />
          </label>
          <p>All admin sessions will be signed out.</p>
        {/if}

        <button class="primary-button mt-4" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  </div>
{/if}
