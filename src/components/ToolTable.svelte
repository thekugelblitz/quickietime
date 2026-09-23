<script lang="ts">
  import { toolCatalog, toolCategories, type Tool } from '@/lib/config';
  import { Search, Sparkles, ChevronDown, ChevronUp } from 'lucide-svelte';

  let { selected = 'tagline', onselect } = $props<{
    selected?: Tool;
    onselect?: (id: Tool) => void;
  }>();

  let query = $state('');
  let currentCategory = $state<string>('All');
  const PAGE_SIZE = 12;
  let visibleLimit = $state(PAGE_SIZE);

  function setCategory(cat: string) {
    currentCategory = cat;
    visibleLimit = PAGE_SIZE;
  }

  const filteredTools = $derived(
    toolCatalog.filter((t) => {
      const matchCat = currentCategory === 'All' || t.category === currentCategory;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    })
  );

  const displayedTools = $derived(
    query.trim().length > 0
      ? filteredTools
      : filteredTools.slice(0, visibleLimit)
  );

  const hasMore = $derived(
    !query.trim() && visibleLimit < filteredTools.length
  );

  const remainingCount = $derived(filteredTools.length - visibleLimit);

  function loadMore() {
    visibleLimit = Math.min(visibleLimit + PAGE_SIZE, filteredTools.length);
  }

  function showAll() {
    visibleLimit = filteredTools.length;
  }

  function collapse() {
    visibleLimit = PAGE_SIZE;
  }

  function handleSelect(id: Tool) {
    if (onselect) {
      onselect(id);
    } else {
      window.location.href = `/?tool=${id}#page-content`;
    }
  }
</script>

<section class="tool-directory" aria-label="Writing tools">
  <!-- Heading / Search Bar -->
  <div class="directory-heading flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <Sparkles size={20} class="text-[var(--lime)]" />
        <h2>Pick your Quickie.</h2>
        <span class="px-2.5 py-0.5 rounded-full bg-[var(--lime)] text-[#202613] text-xs font-black">50 tools</span>
      </div>
      <p class="mt-1">Every tool. One credit or unlimited with BYOK. Zero chat preamble.</p>
    </div>

    <!-- Quick search input -->
    <div class="relative max-w-xs w-full">
      <Search size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70" />
      <input
        type="search"
        placeholder="Filter 50 tools..."
        aria-label="Filter 50 tools"
        class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime)]"
        bind:value={query}
      />
    </div>
  </div>

  <!-- Category filter bar (scrollable pills) -->
  <div class="p-3 bg-[var(--panel)] border-b border-[var(--border)] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
    <button
      type="button"
      class={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
        currentCategory === 'All'
          ? 'bg-[var(--lime)] text-[#202613] font-bold shadow-sm'
          : 'bg-[var(--muted)] text-[var(--ink)] hover:bg-[var(--border)]'
      }`}
      onclick={() => setCategory('All')}
    >
      All (50)
    </button>
    {#each toolCategories as cat}
      {@const count = toolCatalog.filter((t) => t.category === cat).length}
      <button
        type="button"
        class={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          currentCategory === cat
            ? 'bg-[var(--lime)] text-[#202613] font-bold shadow-sm'
            : 'bg-[var(--muted)] text-[var(--ink)] hover:bg-[var(--border)]'
        }`}
        onclick={() => setCategory(cat)}
      >
        {cat} ({count})
      </button>
    {/each}
  </div>

  <!-- Desktop Tabular View (Visible on md and up) -->
  <table class="hidden md:table w-full">
    <thead>
      <tr>
        <th scope="col">Tool</th>
        <th scope="col">Category</th>
        <th scope="col">What it does</th>
        <th scope="col">Get started</th>
      </tr>
    </thead>
    <tbody>
      {#if displayedTools.length === 0}
        <tr>
          <td colspan="4" class="py-12 text-center text-[var(--subtle)]">
            No tools found matching "{query}". Try another search or select "All".
          </td>
        </tr>
      {:else}
        {#each displayedTools as t (t.id)}
          <tr data-selected={selected === t.id}>
            <td>
              <button
                type="button"
                aria-pressed={selected === t.id}
                class="font-bold text-left hover:underline text-[var(--ink)]"
                onclick={() => handleSelect(t.id)}
              >
                {t.name}
              </button>
            </td>
            <td>
              <span class="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--subtle)] whitespace-nowrap">
                {t.category}
              </span>
            </td>
            <td>
              <span class="text-[var(--ink)]">{t.description}</span>
              <a class="tool-guide inline-block ml-2 text-xs text-[var(--link-color)] underline font-medium" href={`/tools/${t.id}`} aria-label={`Tips and examples for ${t.name}`}>Tips & examples</a>
            </td>
            <td>
              <button
                type="button"
                class={`tool-use ${selected === t.id ? 'bg-[var(--lime)] text-[#202613] border-[#a6c64d] font-bold shadow-sm' : ''}`}
                onclick={() => handleSelect(t.id)}
              >
                {selected === t.id ? 'Selected' : 'Use tool'}
              </button>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>

  <!-- Mobile Responsive Card View (Visible below md) -->
  <div class="mobile-tool-cards md:hidden p-3 divide-y divide-[var(--border)] bg-[var(--panel)]">
    {#if displayedTools.length === 0}
      <div class="py-12 text-center text-[var(--subtle)]">
        No tools found matching "{query}". Try another search or select "All".
      </div>
    {:else}
      {#each displayedTools as t (t.id)}
        <article
          class={`py-3.5 first:pt-1 last:pb-1 flex flex-col gap-2 transition-colors ${
            selected === t.id ? 'bg-[var(--muted)]/50 -mx-3 px-3 rounded-xl' : ''
          }`}
        >
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-pressed={selected === t.id}
              class="font-bold text-base text-left hover:underline text-[var(--ink)] truncate"
              onclick={() => handleSelect(t.id)}
            >
              {t.name}
            </button>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--subtle)] shrink-0">
              {t.category}
            </span>
          </div>

          <p class="text-xs text-[var(--subtle)] leading-relaxed">
            {t.description}
          </p>

          <div class="flex items-center justify-between gap-3 pt-1">
            <a
              class="text-xs text-[var(--link-color)] underline font-medium"
              href={`/tools/${t.id}`}
              aria-label={`Tips and examples for ${t.name}`}
            >
              Tips & examples →
            </a>

            <button
              type="button"
              class={`text-xs font-bold py-1.5 px-3.5 rounded-xl border transition-all ${
                selected === t.id
                  ? 'bg-[var(--lime)] text-[#202613] border-[#a6c64d] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--page)] text-[var(--ink)] hover:bg-[var(--muted)]'
              }`}
              onclick={() => handleSelect(t.id)}
            >
              {selected === t.id ? 'Selected' : 'Use tool'}
            </button>
          </div>
        </article>
      {/each}
    {/if}
  </div>

  <!-- Pagination / Load More Footer -->
  {#if !query.trim() && filteredTools.length > PAGE_SIZE}
    <div class="p-4 bg-[var(--panel)] border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
      <span class="text-xs text-[var(--subtle)] font-medium">
        Showing {displayedTools.length} of {filteredTools.length} tools
      </span>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        {#if hasMore}
          <button
            type="button"
            class="flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold bg-[var(--lime)] text-[#202613] hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-1.5"
            onclick={loadMore}
          >
            <span>Load more tools (+{Math.min(PAGE_SIZE, remainingCount)})</span>
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            class="flex-1 sm:flex-none py-2 px-3.5 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--page)] text-[var(--ink)] hover:bg-[var(--muted)] transition-all"
            onclick={showAll}
          >
            Show all {filteredTools.length}
          </button>
        {:else}
          <button
            type="button"
            class="py-2 px-4 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--page)] text-[var(--ink)] hover:bg-[var(--muted)] transition-all flex items-center justify-center gap-1.5"
            onclick={collapse}
          >
            <span>Show less (compact view)</span>
            <ChevronUp size={14} />
          </button>
        {/if}
      </div>
    </div>
  {/if}
</section>
