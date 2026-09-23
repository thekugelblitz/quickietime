<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, Moon } from 'lucide-svelte';

  let { className = '', showLabel = false } = $props<{
    className?: string;
    showLabel?: boolean;
  }>();

  let isDark = $state(false);

  function syncTheme() {
    if (typeof document !== 'undefined') {
      isDark = document.documentElement.classList.contains('dark');
    }
  }

  function toggle() {
    const next = !isDark;
    isDark = next;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('qt-dark', String(next));
    } catch {}
    window.dispatchEvent(new CustomEvent('qt-theme-change', { detail: { dark: next } }));
  }

  onMount(() => {
    syncTheme();
    window.addEventListener('qt-theme-change', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('qt-theme-change', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  });
</script>

<button
  type="button"
  class={`theme-toggle ${className}`.trim()}
  aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
  title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
  onclick={toggle}
>
  {#if isDark}
    <Sun size={18} />
  {:else}
    <Moon size={18} />
  {/if}
  {#if showLabel}
    <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
  {/if}
</button>
