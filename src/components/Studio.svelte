<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Zap,
    History,
    Heart,
    Sparkles,
    PenLine,
    AlignLeft,
    MessageCircle,
    Megaphone,
    Type,
    Copy,
    Key,
    X,
    Search,
  } from 'lucide-svelte';
  import BriefForm from './BriefForm.svelte';
  import WritingResult from './WritingResult.svelte';
  import StudioSample from './StudioSample.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import Toaster from './Toaster.svelte';
  import { toast } from '@/src/lib/toast.svelte';
  import {
    type Brief,
    type Entry,
    type Result,
    type Tool,
    toolCatalog,
    toolCategories,
    defaultBrief,
    isDocument,
    countOptions,
  } from '@/lib/config';
  import { starters, readDrafts, nextDraft, draftSchema } from '@/lib/studio';
  import { api, local, persist, stash } from '@/lib/client';
  import { copyText } from '@/lib/clipboard';

  type Usage = {
    authenticated: boolean;
    remaining: number;
    limit: number;
    configured: boolean;
    paidCredits?: number;
    dailyRemaining?: number;
  };

  let brief = $state<Brief>(defaultBrief('tagline'));
  let entry = $state<Entry | null>(null);
  let usage = $state<Usage | null>(null);
  let busy = $state(false);
  let error = $state('');
  let history = $state<Entry[]>([]);
  let favorites = $state<Result[]>([]);
  let historyOpen = $state(false);
  let savedOpen = $state(false);
  let byokOpen = $state(false);
  let catalogOpen = $state(false);
  let catalogQuery = $state('');
  let selectedCategory = $state<string>('All');
  let historyQuery = $state('');
  let projects = $state<string[]>([]);
  let byokActive = $state(false);
  let byokProvider = $state('');
  let byokKey = $state('');
  let byokModel = $state('');
  let byokBaseUrl = $state('');
  let streamingText = $state('');

  const pinnedTools: Tool[] = ['tagline', 'rewrite', 'summarize', 'social', 'headlines', 'reply'];

  const filteredCatalog = $derived(
    toolCatalog.filter((t) => {
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      const q = catalogQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    })
  );

  function loadSample() {
    const s = starters[brief.tool]?.[0];
    if (s) {
      brief.idea = s.idea;
      if (s.context) brief.context = s.context;
      if (s.tones?.length) brief.tones = [...s.tones];
      toast.show('Example loaded!', 'success');
    }
  }

  let drafts: Partial<Record<Tool, Brief>> = {};
  let toolEntries: Partial<Record<Tool, Entry | null>> = {};

  function restoreBrief(value: unknown, auth: boolean): Brief {
    const parsed = draftSchema.parse(value);
    if (isDocument(parsed.tool)) parsed.count = 1;
    else if (!countOptions(parsed.tool, auth).includes(parsed.count)) {
      parsed.count = countOptions(parsed.tool, auth)[0] as Brief['count'];
    }
    if (parsed.tool !== 'tagline' && ['balanced', 'punchy', 'descriptive'].includes(parsed.length)) {
      parsed.length = 'standard';
    }
    parsed.maxWords = Math.min(parsed.maxWords, auth ? 700 : 300);
    if (!['reply', 'social'].includes(parsed.tool)) parsed.maxLines = 0;
    return parsed;
  }

  function selectTool(t: Tool) {
    if (brief.tool === t) return;
    drafts[brief.tool] = { ...brief };
    toolEntries[brief.tool] = entry;
    try {
      sessionStorage.setItem('qt-studio-drafts', JSON.stringify(drafts));
    } catch {}
    brief = nextDraft(t, drafts, brief.project);
    entry = toolEntries[t] || null;
  }

  async function loadInitialData() {
    try {
      const toolParam = new URLSearchParams(window.location.search).get('tool') as Tool;
      drafts = readDrafts(sessionStorage.getItem('qt-studio-drafts'));
      const selected = toolCatalog.some((t) => t.id === toolParam) ? toolParam : 'tagline';
      brief = nextDraft(selected, drafts, '');
      history = local('qt-history', []);
      favorites = local('qt-favorites', []);
    } catch {}

    try {
      const u = await api<Usage>('usage');
      usage = u;
      brief = restoreBrief(brief, u.authenticated);

      if (u.authenticated) {
        const [f, p, b] = await Promise.all([
          api<{ results: Result[] }>('favorites').catch(() => ({ results: [] })),
          api<{ projects: string[] }>('projects').catch(() => ({ projects: [] })),
          api<{ configured: boolean; enabled: boolean; provider: string; maskedKey?: string }>('byok').catch(() => ({
            configured: false,
            enabled: false,
            provider: '',
          })),
        ]);
        favorites = f.results;
        projects = p.projects;
        if (b.configured && b.enabled) {
          byokActive = true;
          byokProvider = b.provider;
        }
      }
    } catch (err) {
      console.warn('Initial usage load notice:', err);
    }
  }

  onMount(() => {
    loadInitialData();
  });

  async function submitBrief() {
    if (busy) return;
    busy = true;
    error = '';
    streamingText = '';

    const payload = {
      ...brief,
      byok: byokActive && byokKey ? { provider: byokProvider, apiKey: byokKey, model: byokModel, baseUrl: byokBaseUrl } : undefined,
    };

    try {
      // Try Server-Sent Events / streaming request first
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || 'Generation failed. Try another Quickie.');
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const parsed = JSON.parse(line.slice(5).trim());
                if (parsed.chunk) {
                  streamingText += parsed.chunk;
                }
                if (parsed.entry) {
                  entry = parsed.entry;
                  if (parsed.remaining !== undefined && usage) {
                    usage.remaining = parsed.remaining;
                  }
                }
              } catch {}
            }
          }
        }
      } else {
        const data = await res.json();
        entry = data.entry;
        if (data.remaining !== undefined && usage) {
          usage.remaining = data.remaining;
        }
      }

      if (entry) {
        // Save to history
        if (!usage?.authenticated) {
          const nextHistory = [entry, ...history.slice(0, 49)];
          history = nextHistory;
          persist('qt-history', nextHistory);
        }
        toast.success('Your Quickie is ready!');
      }
    } catch (err) {
      error = (err as Error).message || 'Generation failed.';
      toast.error(error);
    } finally {
      busy = false;
    }
  }

  async function handleTransform(action: string) {
    if (busy || !entry) return;
    busy = true;
    error = '';
    try {
      const data = await api<{ entry: Entry; remaining: number }>('transform', {
        ...entry.brief,
        parentId: entry.id,
        action,
        text: entry.results[0]?.text || '',
      });
      entry = data.entry;
      if (data.remaining !== undefined && usage) {
        usage.remaining = data.remaining;
      }
      toast.success(`Transformation "${action}" applied!`);
    } catch (err) {
      toast.error((err as Error).message || 'Transformation failed.');
    } finally {
      busy = false;
    }
  }

  async function handleSaveEditedVersion(text: string, format: Brief['format']) {
    if (!entry) return;
    const nextResult = { ...entry.results[0], id: crypto.randomUUID(), text };
    const nextEntry: Entry = {
      ...entry,
      id: crypto.randomUUID(),
      parentId: entry.id,
      results: [nextResult],
      brief: { ...entry.brief, format },
      createdAt: new Date().toISOString(),
    };
    entry = nextEntry;

    if (!usage?.authenticated) {
      const nextHistory = [nextEntry, ...history.slice(0, 49)];
      history = nextHistory;
      persist('qt-history', nextHistory);
    } else {
      await api('history', {
        id: entry.id,
        results: [nextResult],
        format,
      }, 'PATCH').catch(() => {});
    }
  }

  function toggleFavorite(res: Result) {
    const exists = favorites.some((f) => f.id === res.id);
    if (exists) {
      favorites = favorites.filter((f) => f.id !== res.id);
    } else {
      favorites = [res, ...favorites];
    }
    if (!usage?.authenticated) {
      persist('qt-favorites', favorites);
    } else {
      api('favorites', res, 'POST').catch(() => {});
    }
    toast.show(exists ? 'Removed from favorites' : 'Saved to favorites!', 'success');
  }

  async function copyAll() {
    if (!entry) return;
    const allText = entry.results.map((r, i) => `${i + 1}. ${r.text}`).join('\n\n');
    await copyText(allText);
    toast.success('All results copied!');
  }

  async function saveByok() {
    try {
      await api('byok', {
        provider: byokProvider || 'openai',
        apiKey: byokKey,
        model: byokModel,
        baseUrl: byokBaseUrl,
        enabled: true,
      });
      byokActive = true;
      byokOpen = false;
      toast.success('BYOK API configuration saved!');
    } catch (err) {
      toast.error((err as Error).message || 'Could not save BYOK configuration.');
    }
  }

  const creditCount = $derived(usage?.remaining ?? 5);
  const creditLimit = $derived(usage?.limit ?? 5);
  const meterPercent = $derived(Math.min(100, Math.max(0, (creditCount / creditLimit) * 100)));
</script>

<Toaster />

<!-- Studio Header Section -->
<div class="studio-intro">
  <div>
    <span class="intro-kicker">
      <Zap size={14} class="tiny-zap" /> 50 SPECIALIZED AI MICRO-TOOLS
    </span>
    <h1>Small effort. <span>Better words.</span></h1>
    <p class="intro-description">
      No blank pages, no tedious prompting. Pick a tool, give it direction, and get sharp first drafts you can refine for free.
    </p>
  </div>

  <div class="credit-ticket">
    <div class="ticket-heading">
      <Zap size={14} />
      <span>{byokActive ? 'BYOK UNLIMITED' : 'DAILY ALLOWANCE'}</span>
    </div>
    <strong>
      {byokActive ? '∞' : creditCount}
      <span>{byokActive ? 'credits' : `/ ${creditLimit}`}</span>
    </strong>
    <div class="credit-meter">
      <span style={`width: ${byokActive ? 100 : meterPercent}%;`}></span>
    </div>
    <p>{byokActive ? `Provider: ${byokProvider || 'Custom'}` : usage?.authenticated ? 'Resets at midnight UTC' : '5 free guest credits'}</p>
    <small>
      {#if !usage?.authenticated}
        <a href="/auth" class="underline font-semibold text-inherit">Sign in for 20 / day →</a>
      {:else if !byokActive}
        <button type="button" class="underline font-semibold text-inherit" onclick={() => (byokOpen = true)}>
          Connect BYOK for unlimited →
        </button>
      {:else}
        <button type="button" class="underline font-semibold text-inherit" onclick={() => (byokOpen = true)}>
          Configure BYOK settings
        </button>
      {/if}
    </small>
  </div>
</div>

<!-- Tool Nav Bar -->
<div class="tool-nav">
  <div class="flex items-center justify-between gap-2 bg-[var(--ink)] p-2 rounded-2xl max-md:hidden" role="tablist">
    <!-- Pinned tools -->
    <div class="flex items-center gap-1.5 overflow-x-auto flex-1">
      {#each pinnedTools as pid}
        {@const t = toolCatalog.find((x) => x.id === pid)!}
        <button
          type="button"
          role="tab"
          aria-selected={brief.tool === t.id}
          class={`flex items-center gap-2 py-2.5 px-3.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            brief.tool === t.id
              ? 'bg-[var(--lime)] text-[#253114] shadow-md'
              : 'text-[var(--panel)] hover:bg-white/10'
          }`}
          onclick={() => selectTool(t.id)}
        >
          {#if t.id === 'tagline'}
            <Sparkles size={16} />
          {:else if t.id === 'rewrite'}
            <PenLine size={16} />
          {:else if t.id === 'summarize'}
            <AlignLeft size={16} />
          {:else if t.id === 'reply'}
            <MessageCircle size={16} />
          {:else if t.id === 'social'}
            <Megaphone size={16} />
          {:else}
            <Type size={16} />
          {/if}
          <span>{t.name}</span>
        </button>
      {/each}

      <!-- If current tool is outside the pinned tools, display active tool badge -->
      {#if !pinnedTools.includes(brief.tool)}
        {@const activeTool = toolCatalog.find((x) => x.id === brief.tool)}
        {#if activeTool}
          <div class="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--lime)] text-[#253114] text-sm font-bold shadow-md whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-[#253114] animate-pulse"></span>
            <span>{activeTool.name}</span>
            <span class="text-[11px] opacity-75 font-normal">({activeTool.category})</span>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Browse All 50 Tools Button -->
    <button
      type="button"
      class="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-[var(--panel)] bg-white/10 hover:bg-white/20 transition-all border border-white/15 flex-none"
      onclick={() => (catalogOpen = true)}
    >
      <Search size={15} />
      <span>All 50 Tools</span>
      <span class="px-2 py-0.5 rounded-full bg-[var(--lime)] text-[#253114] text-xs font-black">50</span>
    </button>
  </div>

  <!-- Mobile tool selector -->
  <div class="mobile-tool-picker md:hidden">
    <div class="flex items-center justify-between gap-2 mb-1.5">
      <label for="mobile-tool" class="text-xs font-bold tracking-wider uppercase">Select tool</label>
      <button
        type="button"
        class="text-xs font-semibold text-[var(--primary)] underline flex items-center gap-1"
        onclick={() => (catalogOpen = true)}
      >
        <Search size={12} /> Search all 50
      </button>
    </div>
    <select
      id="mobile-tool"
      value={brief.tool}
      onchange={(e) => selectTool((e.target as HTMLSelectElement).value as Tool)}
    >
      {#each toolCategories as cat}
        <optgroup label={cat}>
          {#each toolCatalog.filter((t) => t.category === cat) as t}
            <option value={t.id}>{t.name} — {t.description}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
  </div>
</div>

<!-- Studio Main Workspace -->
<div class="workspace studio-workspace">
  <!-- Left Column: The Brief Form -->
  <BriefForm
    bind:brief
    authenticated={usage?.authenticated ?? false}
    {busy}
    remaining={usage?.remaining ?? 5}
    {projects}
    isByok={byokActive}
    {byokProvider}
    onsubmit={submitBrief}
  />

  <!-- Right Column: Generation Outputs -->
  <section class="output studio-output">
    <div class="panel-heading">
      <span class="step-tag">02 / THE RESULT</span>
      <div style="display: flex; gap: 8px;">
        <button
          type="button"
          class="icon-button"
          aria-label="History"
          title="History"
          onclick={() => (historyOpen = true)}
        >
          <History size={18} />
        </button>
        <button
          type="button"
          class="icon-button"
          aria-label="Favorites"
          title="Favorites"
          onclick={() => (savedOpen = true)}
        >
          <Heart size={18} />
        </button>
      </div>
    </div>

    {#if busy}
      <div class="studio-empty">
        <div class="loading-pulse"></div>
        <h2>Finding the right words…</h2>
        <p class="text-sm text-[var(--subtle)]">
          {streamingText ? 'Generating draft…' : 'Applying tone, constraints and structure.'}
        </p>
        {#if streamingText}
          <div class="mt-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] text-left text-sm whitespace-pre-wrap max-w-md w-full">
            {streamingText}
          </div>
        {/if}
      </div>
    {:else if entry && entry.results.length > 0}
      <div class="output-title">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>{entry.title}</h2>
          {#if entry.results.length > 1}
            <button type="button" class="copy-all" onclick={copyAll}>
              <Copy size={14} /> Copy all
            </button>
          {/if}
        </div>
        <p>Generated with {entry.provider || 'AI'}. Free manual editing, version saves and downloads.</p>
      </div>

      <div class="results-list">
        {#each entry.results as res, idx (res.id)}
          <WritingResult
            result={res}
            brief={entry.brief}
            index={idx}
            saved={favorites.some((f) => f.id === res.id)}
            {busy}
            onfavorite={() => toggleFavorite(res)}
            ontransform={handleTransform}
            onsave={(text, fmt) => handleSaveEditedVersion(text, fmt)}
          />
        {/each}
      </div>

      <button type="button" class="another" onclick={submitBrief} disabled={busy}>
        <Sparkles size={16} /> Try another Quickie with this brief
      </button>
    {:else}
      <StudioSample tool={brief.tool} ontry={loadSample} />
    {/if}
  </section>
</div>

<!-- All 50 Tools Modal -->
{#if catalogOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onclick={() => (catalogOpen = false)}>
    <div
      class="relative w-full max-w-[880px] max-h-[90vh] rounded-3xl bg-[var(--panel)] border border-[var(--border)] p-6 text-[var(--ink)] shadow-2xl flex flex-col"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <div class="flex items-center gap-2">
            <Sparkles size={20} class="text-[var(--primary)]" />
            <h2 class="text-xl font-extrabold tracking-tight">AI Micro-Tool Directory</h2>
            <span class="px-2.5 py-0.5 rounded-full bg-[var(--lime)] text-[#253114] text-xs font-black">50 tools</span>
          </div>
          <p class="text-xs text-[var(--subtle)] mt-1">Every tool runs on 1 credit or unlimited with BYOK. Select any tool to switch instantly.</p>
        </div>
        <button type="button" class="icon-button" onclick={() => (catalogOpen = false)}>
          <X size={20} />
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="my-4 grid gap-3">
        <div class="relative">
          <Search size={18} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
          <input
            type="search"
            placeholder="Search 50 tools by name, description or keywords (e.g. regex, recipe, sql, bio)..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            bind:value={catalogQuery}
          />
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            type="button"
            class={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-[var(--ink)] text-[var(--panel)] shadow-sm'
                : 'bg-[var(--muted)] text-[var(--ink)] hover:bg-[var(--border)]'
            }`}
            onclick={() => (selectedCategory = 'All')}
          >
            All (50)
          </button>
          {#each toolCategories as cat}
            {@const count = toolCatalog.filter((t) => t.category === cat).length}
            <button
              type="button"
              class={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[var(--ink)] text-[var(--panel)] shadow-sm'
                  : 'bg-[var(--muted)] text-[var(--ink)] hover:bg-[var(--border)]'
              }`}
              onclick={() => (selectedCategory = cat)}
            >
              {cat} ({count})
            </button>
          {/each}
        </div>
      </div>

      <!-- Tools Grid -->
      <div class="flex-1 overflow-y-auto pr-1 grid sm:grid-cols-2 gap-3 min-h-[300px]">
        {#if filteredCatalog.length === 0}
          <div class="col-span-2 py-16 text-center text-[var(--subtle)]">
            <p class="font-bold text-base">No tools found matching "{catalogQuery}"</p>
            <p class="text-xs mt-1">Try another keyword or select "All" categories.</p>
          </div>
        {:else}
          {#each filteredCatalog as t (t.id)}
            <button
              type="button"
              class={`group text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                brief.tool === t.id
                  ? 'border-[var(--lime)] bg-[var(--lime)]/10 ring-2 ring-[var(--lime)]'
                  : 'border-[var(--border)] bg-[var(--page)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/50'
              }`}
              onclick={() => {
                selectTool(t.id);
                catalogOpen = false;
                toast.success(`Switched to ${t.name}`);
              }}
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span class="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                    {t.name}
                  </span>
                  <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--subtle)]">
                    {t.category}
                  </span>
                </div>
                <p class="text-xs text-[var(--subtle)] line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div class="mt-3 pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between text-xs">
                <span class="text-[11px] text-[var(--subtle)] font-mono truncate max-w-[200px]">
                  {t.example}
                </span>
                <span class={`font-bold shrink-0 ml-2 ${brief.tool === t.id ? 'text-[var(--primary)]' : 'text-[var(--subtle)] group-hover:text-[var(--ink)]'}`}>
                  {brief.tool === t.id ? '✓ Selected' : 'Use tool →'}
                </span>
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- History Modal -->
{#if historyOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onclick={() => (historyOpen = false)}>
    <div
      class="history-dialog relative w-full max-w-[760px] rounded-2xl bg-[var(--panel)] p-6 text-[var(--ink)] shadow-2xl"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <h2 class="text-xl font-bold">Writing history</h2>
        <button type="button" class="icon-button" onclick={() => (historyOpen = false)}>
          <X size={20} />
        </button>
      </div>
      <div class="my-4">
        <input
          type="search"
          placeholder="Search history by idea, text or project…"
          class="history-search"
          bind:value={historyQuery}
        />
      </div>
      <div class="history-scroll max-h-[60vh] overflow-y-auto">
        {#if history.length === 0}
          <p class="py-12 text-center text-[var(--subtle)]">No history recorded yet.</p>
        {:else}
          {#each history.filter((h) => !historyQuery || JSON.stringify(h).toLowerCase().includes(historyQuery.toLowerCase())) as h (h.id)}
            <button
              type="button"
              class="history-entry hover:bg-[var(--muted)] p-3 rounded-xl transition-all"
              onclick={() => {
                brief = { ...h.brief };
                entry = h;
                historyOpen = false;
                toast.success('Draft restored!');
              }}
            >
              <span>
                <strong>{h.brief.tool.toUpperCase()}:</strong> {h.title || h.brief.idea}
              </span>
              <small>{new Date(h.createdAt).toLocaleDateString()}</small>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Favorites Modal -->
{#if savedOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onclick={() => (savedOpen = false)}>
    <div
      class="history-dialog relative w-full max-w-[760px] rounded-2xl bg-[var(--panel)] p-6 text-[var(--ink)] shadow-2xl"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <h2 class="text-xl font-bold">Saved favorites</h2>
        <button type="button" class="icon-button" onclick={() => (savedOpen = false)}>
          <X size={20} />
        </button>
      </div>
      <div class="history-scroll max-h-[60vh] overflow-y-auto mt-4">
        {#if favorites.length === 0}
          <p class="py-12 text-center text-[var(--subtle)]">No favorites saved yet.</p>
        {:else}
          <div class="grid gap-3">
            {#each favorites as fav (fav.id)}
              <div class="p-4 rounded-xl border border-[var(--border)] bg-[var(--page)] flex items-center justify-between gap-4">
                <p class="font-medium text-base">{fav.text}</p>
                <button
                  type="button"
                  class="primary-button text-xs py-2 px-3 flex-none"
                  onclick={() => {
                    copyText(fav.text);
                    toast.success('Favorite copied!');
                  }}
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- BYOK Settings Modal -->
{#if byokOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onclick={() => (byokOpen = false)}>
    <div
      class="relative w-full max-w-[500px] rounded-2xl bg-[var(--panel)] p-6 text-[var(--ink)] shadow-2xl border border-[var(--border)]"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div class="flex items-center gap-2">
          <Key size={20} class="text-[var(--primary)]" />
          <h2 class="text-xl font-bold">Bring Your Own Key (BYOK)</h2>
        </div>
        <button type="button" class="icon-button" onclick={() => (byokOpen = false)}>
          <X size={20} />
        </button>
      </div>
      <p class="text-sm text-[var(--subtle)] my-3">
        Connect your own AI API key for 100% free, unlimited generations directly from your provider.
      </p>

      <form onsubmit={(e) => { e.preventDefault(); saveByok(); }} class="grid gap-4 mt-4">
        <label class="grid gap-1.5 text-sm font-semibold">
          AI Provider
          <select bind:value={byokProvider} class="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--page)]">
            <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
            <option value="anthropic">Anthropic (Claude 3.5 Haiku, Sonnet)</option>
            <option value="openrouter">OpenRouter (Any model)</option>
            <option value="cheaperinference">CheaperInference</option>
            <option value="custom">Custom OpenAI-Compatible API</option>
          </select>
        </label>

        <label class="grid gap-1.5 text-sm font-semibold">
          API Key
          <input
            type="password"
            bind:value={byokKey}
            placeholder="sk-..."
            required
            class="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--page)]"
          />
        </label>

        <label class="grid gap-1.5 text-sm font-semibold">
          Model Override (Optional)
          <input
            type="text"
            bind:value={byokModel}
            placeholder="e.g. gpt-4o-mini or claude-3-5-haiku"
            class="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--page)]"
          />
        </label>

        {#if byokProvider === 'custom'}
          <label class="grid gap-1.5 text-sm font-semibold">
            Base URL
            <input
              type="url"
              bind:value={byokBaseUrl}
              placeholder="https://api.together.xyz/v1"
              required
              class="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--page)]"
            />
          </label>
        {/if}

        <div class="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            class="px-4 py-2.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-sm"
            onclick={() => (byokOpen = false)}
          >
            Cancel
          </button>
          <button type="submit" class="primary-button text-sm py-2.5 px-5">
            Save & Activate BYOK
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
