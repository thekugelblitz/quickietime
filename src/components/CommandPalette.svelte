<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Search,
    Sparkles,
    Command,
    X,
    Folder,
    Moon,
    Sun,
    Key,
    Zap,
    ArrowRight,
    ExternalLink
  } from 'lucide-svelte';
  import { toolCatalog } from '@/lib/config';

  let {
    isOpen = $bindable(false),
    onSelectTool
  } = $props<{
    isOpen?: boolean;
    onSelectTool?: (toolId: string) => void;
  }>();

  let query = $state('');
  let selectedIndex = $state(0);
  let isMac = $state(false);
  let inputElement = $state<HTMLInputElement | null>(null);

  onMount(() => {
    isMac = typeof navigator !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);

    function handleKeyDown(e: KeyboardEvent) {
      // Toggle palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen = !isOpen;
        if (isOpen) {
          query = '';
          selectedIndex = 0;
          setTimeout(() => inputElement?.focus(), 50);
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        isOpen = false;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  $effect(() => {
    if (isOpen) {
      setTimeout(() => inputElement?.focus(), 50);
    }
  });

  const filteredTools = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return toolCatalog.slice(0, 10);
    return toolCatalog.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  function selectTool(id: string) {
    isOpen = false;
    if (onSelectTool) {
      onSelectTool(id);
    } else {
      window.location.assign(`/?tool=${id}`);
    }
  }

  function toggleTheme() {
    isOpen = false;
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    window.dispatchEvent(new Event('theme-change'));
  }

  function navigateTo(url: string) {
    isOpen = false;
    window.location.assign(url);
  }

  function handleKeyNavigation(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % (filteredTools.length || 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + (filteredTools.length || 1)) % (filteredTools.length || 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        selectTool(filteredTools[selectedIndex].id);
      }
    }
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    onclick={() => (isOpen = false)}
    role="dialog"
    aria-modal="true"
    aria-label="Command Palette"
  >
    <!-- Modal Container -->
    <div
      class="w-full max-w-2xl bg-[var(--panel)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-[var(--ink)]"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Search Input Header -->
      <div class="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--page)]">
        <Search size={20} class="text-[var(--subtle)] shrink-0" />
        <input
          bind:this={inputElement}
          bind:value={query}
          onkeydown={handleKeyNavigation}
          placeholder="Search 50 writing tools, actions, or jump to page…"
          class="w-full bg-transparent border-none outline-none text-base sm:text-lg text-[var(--ink)] placeholder:text-[var(--subtle)]"
          aria-label="Search tools and commands"
        />
        {#if query}
          <button
            type="button"
            class="text-xs px-2 py-1 rounded bg-[var(--muted)] text-[var(--subtle)] hover:text-[var(--ink)]"
            onclick={() => { query = ''; inputElement?.focus(); }}
          >
            Clear
          </button>
        {/if}
        <kbd class="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-mono rounded bg-[var(--muted)] text-[var(--subtle)] border border-[var(--border)]">
          ESC
        </kbd>
      </div>

      <!-- Quick Actions (Only when query is empty) -->
      {#if !query}
        <div class="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)]/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span class="text-[var(--subtle)] font-bold shrink-0">QUICK:</span>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--panel)] border border-[var(--border)] hover:bg-[var(--lime)] hover:text-[#202613] hover:border-[#a6c64d] transition-all shrink-0 font-medium"
            onclick={() => navigateTo('/dashboard')}
          >
            <Folder size={12} /> Dashboard
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--panel)] border border-[var(--border)] hover:bg-[var(--lime)] hover:text-[#202613] hover:border-[#a6c64d] transition-all shrink-0 font-medium"
            onclick={toggleTheme}
          >
            <Sun size={12} class="dark:hidden" />
            <Moon size={12} class="hidden dark:inline" />
            Toggle Theme
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--panel)] border border-[var(--border)] hover:bg-[var(--lime)] hover:text-[#202613] hover:border-[#a6c64d] transition-all shrink-0 font-medium"
            onclick={() => navigateTo('/pricing')}
          >
            <Zap size={12} /> Plans & Credits
          </button>
        </div>
      {/if}

      <!-- Results List -->
      <div class="overflow-y-auto p-2 divide-y divide-[var(--border)]/50">
        {#if filteredTools.length === 0}
          <div class="py-12 text-center text-[var(--subtle)]">
            <p class="text-base font-semibold">No tools found matching "{query}"</p>
            <p class="text-xs mt-1">Try another search keyword like "social", "email", "code", or "grammar".</p>
          </div>
        {:else}
          <div class="text-[10px] font-bold tracking-wider text-[var(--subtle)] uppercase px-3 py-1.5">
            {query ? `Matching Tools (${filteredTools.length})` : 'Popular Micro-Tools'}
          </div>

          {#each filteredTools as tool, i (tool.id)}
            <button
              type="button"
              class={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                i === selectedIndex
                  ? 'bg-[var(--lime)] text-[#202613] shadow-sm font-semibold'
                  : 'hover:bg-[var(--muted)] text-[var(--ink)]'
              }`}
              onclick={() => selectTool(tool.id)}
              onmouseenter={() => (selectedIndex = i)}
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm sm:text-base">{tool.name}</span>
                  <span class={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    i === selectedIndex
                      ? 'bg-[#202613]/15 text-[#202613]'
                      : 'bg-[var(--muted)] text-[var(--subtle)]'
                  }`}>
                    {tool.category}
                  </span>
                </div>
                <p class={`text-xs mt-0.5 truncate ${
                  i === selectedIndex ? 'text-[#202613]/85' : 'text-[var(--subtle)]'
                }`}>
                  {tool.description}
                </p>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <span class={`text-xs ${i === selectedIndex ? 'text-[#202613]' : 'opacity-0 sm:opacity-50'}`}>
                  Use tool →
                </span>
              </div>
            </button>
          {/each}
        {/if}
      </div>

      <!-- Footer Bar with Keyboard Helper -->
      <div class="px-4 py-2.5 bg-[var(--page)] border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--subtle)]">
        <div class="flex items-center gap-3">
          <span class="hidden sm:inline-flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] font-mono text-[10px]">↑</kbd>
            <kbd class="px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] font-mono text-[10px]">↓</kbd>
            navigate
          </span>
          <span class="inline-flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] font-mono text-[10px]">↵</kbd>
            select
          </span>
        </div>

        <span>50 Total Tools Available</span>
      </div>
    </div>
  </div>
{/if}
