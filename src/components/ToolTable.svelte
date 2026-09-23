<script lang="ts">
  import { toolCatalog, toolCategories, type Tool } from '@/lib/config';
  import { Search, Sparkles } from 'lucide-svelte';

  let { selected = 'tagline', onselect } = $props<{
    selected?: Tool;
    onselect?: (id: Tool) => void;
  }>();

  let query = $state('');
  let currentCategory = $state<string>('All');

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

  function handleSelect(id: Tool) {
    if (onselect) {
      onselect(id);
    } else {
      window.location.href = `/?tool=${id}#page-content`;
    }
  }
</script>

<section class="tool-directory" aria-label="Writing tools">
  <div class="directory-heading flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <Sparkles size={20} class="text-[var(--lime)]" />
        <h2>Pick your Quickie.</h2>
        <span class="px-2.5 py-0.5 rounded-full bg-[var(--lime)] text-[#253114] text-xs font-black">50 tools</span>
      </div>
      <p class="mt-1">Every tool. One credit or unlimited with BYOK. Zero chat preamble.</p>
    </div>

    <!-- Quick search input -->
    <div class="relative max-w-xs w-full">
      <Search size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
      <input
        type="search"
        placeholder="Filter 50 tools..."
        class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime)]"
        bind:value={query}
      />
    </div>
  </div>

  <!-- Category filter bar -->
  <div class="p-3 bg-[var(--panel)] border-b border-[var(--border)] flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
    <button
      type="button"
      class={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
        currentCategory === 'All'
          ? 'bg-[var(--ink)] text-[var(--panel)] shadow-sm'
          : 'bg-[var(--muted)] text-[var(--ink)] hover:bg-[var(--border)]'
      }`}
      onclick={() => (currentCategory = 'All')}
    >
      All (50)
    </button>
    {#each toolCategories as cat}
      {@const count = toolCatalog.filter((t) => t.category === cat).length}
      <button
        type="button"
        class={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          currentCategory === cat
            ? 'bg-[var(--ink)] text-[var(--panel)] shadow-sm'
            : 'bg-[var(--muted)] text-[var(--ink)] hover:bg-[var(--border)]'
        }`}
        onclick={() => (currentCategory = cat)}
      >
        {cat} ({count})
      </button>
    {/each}
  </div>

  <table>
    <thead>
      <tr>
        <th scope="col">Tool</th>
        <th scope="col">Category</th>
        <th scope="col">What it does</th>
        <th scope="col">Get started</th>
      </tr>
    </thead>
    <tbody>
      {#if filteredTools.length === 0}
        <tr>
          <td colspan="4" class="py-12 text-center text-[var(--subtle)]">
            No tools found matching "{query}". Try another search or select "All".
          </td>
        </tr>
      {:else}
        {#each filteredTools as t (t.id)}
          <tr data-selected={selected === t.id}>
            <td>
              <button
                type="button"
                aria-pressed={selected === t.id}
                class="font-bold text-left hover:underline"
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
              {t.description}
              <a class="tool-guide inline-block ml-2 text-xs text-[var(--primary)] underline" href={`/tools/${t.id}`}>Tips & examples</a>
            </td>
            <td>
              <button
                type="button"
                class="tool-use"
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
</section>
