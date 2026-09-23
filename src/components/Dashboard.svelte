<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Zap,
    History,
    Heart,
    Folder,
    Key,
    Download,
    Plus,
    Trash2,
    Copy,
    ArrowUpRight,
    LogOut,
  } from 'lucide-svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import MobileIsland from './MobileIsland.svelte';
  import Toaster from './Toaster.svelte';
  import { toast } from '@/src/lib/toast.svelte';
  import { toolCatalog, type Entry, type Result } from '@/lib/config';
  import { copyText } from '@/lib/clipboard';

  let entries = $state<Entry[]>([]);
  let favorites = $state<Result[]>([]);
  let remaining = $state(20);
  let limit = $state(20);
  let paidCredits = $state(0);
  let total = $state(0);
  let projects = $state<string[]>([]);
  let loading = $state(true);
  let query = $state('');
  let tool = $state('all');
  let project = $state('all');
  let view = $state<'history' | 'favorites' | 'projects' | 'byok'>('history');

  // BYOK
  let byokConfigured = $state(false);
  let byokEnabled = $state(false);
  let byokProvider = $state('openai');
  let byokKey = $state('');
  let byokModel = $state('');
  let byokBaseUrl = $state('');
  let maskedKey = $state('');

  // Project modal
  let newProjectName = $state('');
  let projectModalOpen = $state(false);

  async function loadData() {
    loading = true;
    try {
      const [u, h, f, p, b] = await Promise.all([
        fetch('/api/usage').then((r) => r.json()),
        fetch(`/api/history?tool=${tool}&project=${project}&q=${encodeURIComponent(query)}`).then((r) => r.json()),
        fetch('/api/favorites').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json()),
        fetch('/api/byok').then((r) => r.json()),
      ]);

      remaining = u.remaining ?? 20;
      limit = u.limit ?? 20;
      paidCredits = u.paidCredits ?? 0;
      entries = h.entries ?? [];
      total = h.total ?? entries.length;
      favorites = f.results ?? [];
      projects = p.projects ?? [];

      if (b.configured) {
        byokConfigured = true;
        byokEnabled = b.enabled;
        byokProvider = b.provider;
        byokModel = b.model || '';
        byokBaseUrl = b.baseUrl || '';
        maskedKey = b.maskedKey || '';
      }
    } catch (err) {
      toast.error('Could not load dashboard data.');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadData();
  });

  async function createProject() {
    if (!newProjectName.trim()) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      if (!res.ok) throw new Error('Could not create project');
      projects = [...projects, newProjectName.trim()];
      newProjectName = '';
      projectModalOpen = false;
      toast.success('Project created!');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function deleteEntry(id: string) {
    try {
      await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      entries = entries.filter((e) => e.id !== id);
      total = Math.max(0, total - 1);
      toast.success('Item deleted.');
    } catch {
      toast.error('Could not delete item.');
    }
  }

  async function saveByok() {
    try {
      const res = await fetch('/api/byok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: byokProvider,
          apiKey: byokKey,
          model: byokModel,
          baseUrl: byokBaseUrl,
          enabled: true,
        }),
      });
      if (!res.ok) throw new Error('Could not save BYOK settings');
      byokConfigured = true;
      byokEnabled = true;
      toast.success('BYOK settings updated!');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/');
  }
</script>

<Toaster />

<header class="site-header">
  <a class="brand" href="/">
    <span class="brand-icon">
      <Zap size={22} fill="currentColor" />
    </span>
    QuickieTime
  </a>
  <nav aria-label="Dashboard navigation">
    <a href="/" class="text-sm font-semibold">Studio ↗</a>
    <a href="/pricing" class="text-sm font-semibold">Plans</a>
    <a href="/account" class="text-sm font-semibold">Account</a>
    <ThemeToggle />
    <button type="button" class="signin" onclick={logout}>
      <LogOut size={15} /> Sign out
    </button>
  </nav>
</header>

<MobileIsland authenticated={true} />

<main class="dashboard" id="page-content">
  <div class="dashboard-heading">
    <div>
      <span class="step-tag">YOUR ACCOUNT CONTROL STATION</span>
      <h1>Creative Workspace</h1>
      <p>Organize drafts, search historical generations, and manage BYOK unlimited keys.</p>
    </div>
    <a class="primary-button" href="/">
      <Zap size={16} /> Open Studio
    </a>
  </div>

  <!-- Key Metrics -->
  <div class="dashboard-stats">
    <div>
      <span>Credits Remaining</span>
      <strong>{byokEnabled ? '∞ BYOK' : remaining}</strong>
      <small>{limit} daily allowance{paidCredits ? ` · ${paidCredits} pack credits` : ''}</small>
    </div>
    <div>
      <span>Total Generations</span>
      <strong>{total}</strong>
      <small>Saved private drafts</small>
    </div>
    <div>
      <span>Saved Favorites</span>
      <strong>{favorites.length}</strong>
      <small>Bookmarked winners</small>
    </div>
  </div>

  <!-- Navigation Tabs -->
  <div class="dashboard-toolbar">
    <button
      type="button"
      aria-pressed={view === 'history'}
      onclick={() => (view = 'history')}
    >
      <History size={16} /> Library & History ({total})
    </button>
    <button
      type="button"
      aria-pressed={view === 'favorites'}
      onclick={() => (view = 'favorites')}
    >
      <Heart size={16} /> Favorites ({favorites.length})
    </button>
    <button
      type="button"
      aria-pressed={view === 'projects'}
      onclick={() => (view = 'projects')}
    >
      <Folder size={16} /> Projects ({projects.length})
    </button>
    <button
      type="button"
      aria-pressed={view === 'byok'}
      onclick={() => (view = 'byok')}
    >
      <Key size={16} /> BYOK Unlimited {byokEnabled ? '✓' : ''}
    </button>
    <a
      href="/api/export?format=json"
      download="quickietime-export.json"
      class="border border-[var(--border)] rounded-lg py-2.5 px-3.5 text-sm flex items-center gap-1.5 ml-auto hover:bg-[var(--muted)]"
    >
      <Download size={15} /> Export JSON
    </a>
  </div>

  <!-- View: History -->
  {#if view === 'history'}
    <div class="dashboard-filters">
      <label>
        Search library
        <input
          type="search"
          placeholder="Filter by keyword, idea or output text…"
          bind:value={query}
          oninput={loadData}
        />
      </label>
      <label>
        Tool
        <select bind:value={tool} onchange={loadData}>
          <option value="all">All tools</option>
          {#each toolCatalog as t}
            <option value={t.id}>{t.name}</option>
          {/each}
        </select>
      </label>
      <label>
        Project
        <select bind:value={project} onchange={loadData}>
          <option value="all">All projects</option>
          <option value="Unfiled">Unfiled</option>
          {#each projects as p}
            <option value={p}>{p}</option>
          {/each}
        </select>
      </label>
    </div>

    {#if loading}
      <p class="py-16 text-center text-[var(--subtle)]">Loading your library…</p>
    {:else if entries.length === 0}
      <div class="empty">
        <Sparkles size={32} />
        <h3>No drafts found</h3>
        <p>Start a new writing session in the studio to save your work.</p>
        <a class="primary-button inline-flex mt-4" href="/">
          Open Studio →
        </a>
      </div>
    {:else}
      <div class="dashboard-grid">
        {#each entries as e (e.id)}
          <article class="saved-work">
            <span class="category-pill">{e.brief.tool.toUpperCase()}</span>
            <h2>{e.title || e.brief.idea}</h2>
            <p>{e.results[0]?.text}</p>
            <small>
              {new Date(e.createdAt).toLocaleDateString()} · Project: {e.brief.project || 'Unfiled'}
            </small>
            <div class="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                class="icon-button"
                aria-label="Copy output"
                onclick={() => {
                  copyText(e.results.map((r) => r.text).join('\n\n'));
                  toast.success('Copied!');
                }}
              >
                <Copy size={16} />
              </button>
              <button
                type="button"
                class="icon-button text-red-500 hover:text-red-700 ml-auto"
                aria-label="Delete"
                onclick={() => deleteEntry(e.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- View: Favorites -->
  {#if view === 'favorites'}
    <div class="mt-6">
      {#if favorites.length === 0}
        <div class="empty">
          <Heart size={32} />
          <h3>No favorites saved yet</h3>
          <p>Tap the heart icon on any generated result to bookmark it here.</p>
        </div>
      {:else}
        <div class="grid gap-3">
          {#each favorites as fav (fav.id)}
            <div class="p-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] flex items-center justify-between gap-4">
              <p class="text-lg font-medium">{fav.text}</p>
              <button
                type="button"
                class="primary-button text-xs py-2 px-4 flex-none"
                onclick={() => {
                  copyText(fav.text);
                  toast.success('Copied!');
                }}
              >
                <Copy size={14} /> Copy
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- View: Projects -->
  {#if view === 'projects'}
    <div class="mt-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Projects</h2>
        <button
          type="button"
          class="primary-button text-sm py-2 px-4 inline-flex items-center gap-1.5"
          onclick={() => (projectModalOpen = true)}
        >
          <Plus size={16} /> New project
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        {#each projects as p}
          <div class="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] flex items-center justify-between">
            <span class="font-semibold text-base flex items-center gap-2">
              <Folder size={18} class="text-[var(--primary)]" />
              {p}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- View: BYOK -->
  {#if view === 'byok'}
    <div class="mt-6 max-w-xl bg-[var(--panel)] p-8 rounded-2xl border border-[var(--border)]">
      <div class="flex items-center gap-3 mb-2">
        <Key size={24} class="text-[var(--primary)]" />
        <h2 class="text-2xl font-bold">Bring Your Own Key</h2>
      </div>
      <p class="text-sm text-[var(--subtle)] mb-6">
        Configure your private AI provider credentials for 100% free, unlimited AI generation. Credentials are encrypted on the server using AES-256-GCM.
      </p>

      <form onsubmit={(e) => { e.preventDefault(); saveByok(); }} class="grid gap-4">
        <label>
          Provider
          <select bind:value={byokProvider} class="p-3 rounded-lg border border-[var(--border)] bg-[var(--page)]">
            <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
            <option value="anthropic">Anthropic (Claude 3.5 Haiku, Sonnet)</option>
            <option value="openrouter">OpenRouter</option>
            <option value="cheaperinference">CheaperInference</option>
            <option value="custom">Custom OpenAI-Compatible Endpoint</option>
          </select>
        </label>

        <label>
          API Key {maskedKey ? `(Current: ${maskedKey})` : ''}
          <input
            type="password"
            bind:value={byokKey}
            placeholder="Paste your API key…"
            class="p-3 rounded-lg border border-[var(--border)] bg-[var(--page)]"
          />
        </label>

        <label>
          Model Override (Optional)
          <input
            type="text"
            bind:value={byokModel}
            placeholder="e.g. gpt-4o-mini"
            class="p-3 rounded-lg border border-[var(--border)] bg-[var(--page)]"
          />
        </label>

        {#if byokProvider === 'custom'}
          <label>
            Custom Base URL
            <input
              type="url"
              bind:value={byokBaseUrl}
              placeholder="https://api.example.com/v1"
              required
              class="p-3 rounded-lg border border-[var(--border)] bg-[var(--page)]"
            />
          </label>
        {/if}

        <button type="submit" class="primary-button py-3 mt-4">
          Save & Enable BYOK Unlimited
        </button>
      </form>
    </div>
  {/if}
</main>

<!-- New Project Modal -->
{#if projectModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onclick={() => (projectModalOpen = false)}>
    <div
      class="w-full max-w-md rounded-2xl bg-[var(--panel)] p-6 shadow-2xl border border-[var(--border)]"
      onclick={(e) => e.stopPropagation()}
    >
      <h3 class="text-lg font-bold mb-3">Create New Project</h3>
      <input
        type="text"
        placeholder="Project name (e.g. Acme Brand Launch)"
        bind:value={newProjectName}
        class="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--page)] mb-4 text-base"
      />
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
          onclick={() => (projectModalOpen = false)}
        >
          Cancel
        </button>
        <button
          type="button"
          class="primary-button text-sm py-2 px-4"
          onclick={createProject}
        >
          Create
        </button>
      </div>
    </div>
  </div>
{/if}
