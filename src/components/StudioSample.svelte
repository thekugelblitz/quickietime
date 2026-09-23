<script lang="ts">
  import { ArrowUpRight, Sparkles } from 'lucide-svelte';
  import { sampleLines, starters } from '@/lib/studio';
  import type { Tool } from '@/lib/config';

  let { tool = 'tagline', ontry } = $props<{
    tool: Tool;
    ontry?: () => void;
  }>();

  const s = $derived(sampleLines[tool]);
</script>

<div class="sample-studio">
  <div class="sample-heading">
    <span class="sample-sticker">
      <Sparkles size={15} /> A LITTLE WORD MAGIC
    </span>
    <span class="sample-label">Illustrative example</span>
  </div>
  <div class="sample-before">
    <span>THE RAW MATERIAL</span>
    <p>{s.before}</p>
  </div>
  <div class="sample-after">
    <span>THE QUICKIE</span>
    <p>{s.after}</p>
    <Sparkles class="sample-spark" size={32} />
  </div>
  <div class="sample-footer">
    <p>{s.note}</p>
    <button type="button" onclick={ontry}>
      Try “{starters[tool][0].label}” <ArrowUpRight size={16} />
    </button>
    <small>Loads an example brief. No credit used until you generate.</small>
  </div>
</div>
