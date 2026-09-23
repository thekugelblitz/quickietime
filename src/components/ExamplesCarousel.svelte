<script lang="ts">
  import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-svelte';
  import { sampleLines, starters } from '@/lib/studio';
  import { toolCatalog, type Tool } from '@/lib/config';

  let { ontry } = $props<{
    ontry?: (tool: Tool, idea: string, context?: string) => void;
  }>();

  let track = $state<HTMLDivElement | null>(null);

  const extras = [
    { tool: 'tagline' as Tool, before: 'A plant shop for people who have never kept a plant alive.', after: 'A fresh start. With leaves.', label: 'Plant parent starter kit' },
    { tool: 'reply' as Tool, before: 'Customer asks whether their order has shipped. The verified dispatch date is tomorrow.', after: 'Thanks for checking in. Your order is scheduled to dispatch tomorrow. We’ll share tracking details once it ships.', label: 'A reply with real context' },
    { tool: 'headlines' as Tool, before: 'A newsletter about five practical ways to reduce meeting time.', after: 'Five ways to give your calendar a break', label: 'An honest email subject' },
    { tool: 'rewrite' as Tool, before: 'We would like to bring to your attention that the office will not be operational on Friday.', after: 'Our office will be closed on Friday.', label: 'Less effort. More clarity.' }
  ];

  const examples = [...toolCatalog.map(t => ({ tool: t.id, ...sampleLines[t.id], label: t.name })), ...extras];

  function scrollPrev() {
    track?.scrollBy({ left: -340, behavior: 'smooth' });
  }

  function scrollNext() {
    track?.scrollBy({ left: 340, behavior: 'smooth' });
  }
</script>

<section class="examples-carousel" aria-label="Writing examples">
  <header>
    <div>
      <span class="intro-kicker">A SMALL SPARK GOES A LONG WAY</span>
      <h2>Steal the inspiration.</h2>
      <p>Illustrative examples. Your next idea starts here.</p>
    </div>
    <div class="carousel-controls">
      <button type="button" aria-label="Previous examples" onclick={scrollPrev}>
        <ArrowLeft size={20} />
      </button>
      <button type="button" aria-label="Next examples" onclick={scrollNext}>
        <ArrowRight size={20} />
      </button>
    </div>
  </header>
  <div class="examples-track" bind:this={track} tabindex="0" aria-label="Swipe or scroll through examples">
    {#each examples as e, i (e.label)}
      <article class={`inspiration-card inspiration-${i % 4}`}>
        <span class="category-pill">{toolCatalog.find(t => t.id === e.tool)?.name}</span>
        <h3>{e.label}</h3>
        <div>
          <small>THE BRIEF</small>
          <p>{e.before}</p>
        </div>
        <div class="inspiration-after">
          <small>ONE WAY TO SAY IT</small>
          <p>{e.after}</p>
        </div>
        {#if ontry}
          <button type="button" onclick={() => ontry?.(e.tool, i < toolCatalog.length ? starters[e.tool][0].idea : e.before, i < toolCatalog.length ? starters[e.tool][0].context : undefined)}>
            Try this direction <ArrowUpRight size={16} />
          </button>
        {:else}
          <a href={`/?tool=${e.tool}`}>
            Open this tool <ArrowUpRight size={16} />
          </a>
        {/if}
      </article>
    {/each}
  </div>
  <p class="setting-hint">Swipe to explore. Loading an example is free; generating uses one credit.</p>
</section>
