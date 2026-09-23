<script lang="ts">
  import { Menu, X, Zap, LayoutDashboard, History, Sparkles } from 'lucide-svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  let { authenticated = false, onhistory, onpreserve } = $props<{
    authenticated?: boolean;
    onhistory?: () => void;
    onpreserve?: () => void;
  }>();

  let open = $state(false);
</script>

<nav class="mobile-island" aria-label="Mobile navigation">
  <a href="/" aria-label="Writing studio">
    <Zap size={21} />
    <span>Create</span>
  </a>
  {#if onhistory}
    <button type="button" onclick={onhistory}>
      <History size={21} />
      <span>History</span>
    </button>
  {:else}
    <a href="/tools">
      <Sparkles size={21} />
      <span>Tools</span>
    </a>
  {/if}
  <div class="mobile-island-theme">
    <ThemeToggle />
    <span>Theme</span>
  </div>
  <a href={authenticated ? '/dashboard' : '/auth'} onclick={onpreserve}>
    <LayoutDashboard size={21} />
    <span>{authenticated ? 'Dashboard' : 'Free Account'}</span>
  </a>
  <button
    type="button"
    onclick={() => open = true}
    aria-expanded={open}
    aria-label="Open navigation menu"
  >
    <Menu size={21} />
    <span>Explore</span>
  </button>
</nav>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onclick={() => open = false}>
    <div class="island-menu relative w-full max-w-[440px] rounded-[28px] bg-[var(--panel)] p-7 text-[var(--ink)] shadow-2xl" onclick={(e) => e.stopPropagation()}>
      <h2 class="text-2xl font-bold tracking-tight mb-1">Where next?</h2>
      <p class="text-[var(--subtle)] text-sm mb-4">Good words are just the start.</p>
      <div class="island-menu-theme-row mb-4">
        <span>Appearance</span>
        <ThemeToggle showLabel={true} />
      </div>
      <nav aria-label="More pages" class="grid gap-1">
        {#each [
          ['/pricing', 'Plans & credits'],
          ['/examples', 'Get inspired'],
          ['/guides', 'Writing guides'],
          ['/use-cases', 'Use cases'],
          ['/dashboard', 'Your dashboard'],
          ['/auth', 'Free Account'],
          ['/billing', 'Billing history'],
          ['/faq', 'Questions, answered'],
          ['/contact', 'Get in touch']
        ] as [url, label]}
          <a href={url} class="flex items-center justify-between border-b border-[var(--border)] py-3 px-2 text-base hover:text-[var(--primary)]" onclick={onpreserve}>
            {label}
            <span>↗</span>
          </a>
        {/each}
      </nav>
      <button
        type="button"
        onclick={() => open = false}
        class="island-close mt-4 w-full flex items-center justify-center gap-2 py-3 text-sm text-[var(--subtle)] hover:text-[var(--ink)]"
      >
        <X size={17} /> Close menu
      </button>
    </div>
  </div>
{/if}
