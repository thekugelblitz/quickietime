<script lang="ts">
  import { toast } from '@/src/lib/toast.svelte';
</script>

{#if toast.current}
  <div
    class="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm font-medium shadow-2xl transition-all"
    style="animation: appear 0.2s ease-out;"
    role="status"
    aria-live="polite"
  >
    {#if toast.current.type === 'success'}
      <span class="text-lime-500">✓</span>
    {:else if toast.current.type === 'error'}
      <span class="text-rose-500">✕</span>
    {:else}
      <span class="text-amber-500">ℹ</span>
    {/if}
    <span class="text-[var(--ink)]">{toast.current.message}</span>
  </div>
{/if}
