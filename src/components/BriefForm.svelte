<script lang="ts">
  import { Sparkles, ArrowUpRight } from 'lucide-svelte';
  import {
    type Brief,
    toolCatalog,
    tones,
    creativeTool,
    isDocument,
    countOptions,
    inputLimit,
  } from '@/lib/config';
  import { starters } from '@/lib/studio';
  import { toast } from '@/src/lib/toast.svelte';

  let {
    brief = $bindable(),
    authenticated = false,
    busy = false,
    remaining = null,
    projects = [],
    isByok = false,
    byokProvider = '',
    onsubmit,
  } = $props<{
    brief: Brief;
    authenticated?: boolean;
    busy?: boolean;
    remaining?: number | null;
    projects?: string[];
    isByok?: boolean;
    byokProvider?: string;
    onsubmit?: () => void;
  }>();

  let previous = $state<Brief | null>(null);

  function loadSample(index: number) {
    previous = { ...brief };
    const sample = starters[brief.tool][index];
    brief.idea = sample.idea;
    brief.context = sample.context || '';
    toast.show('Example loaded. No credit used.');
  }

  function undoSample() {
    if (previous) {
      brief = { ...previous };
      previous = null;
    }
  }

  const card = $derived(['tagline', 'headlines'].includes(brief.tool));
  const cap = $derived(authenticated ? 700 : 300);

  const labelMap: Record<string, string> = {
    tagline: 'What needs a tagline?',
    rewrite: 'Paste your original text',
    summarize: 'Paste the text to summarize',
    reply: 'Paste the message you received',
    social: 'What are you posting about?',
    headlines: 'What is the content or offer?',
  };

  const label = $derived(labelMap[brief.tool] || 'What is the subject?');
  const availableTones = $derived(
    creativeTool(brief.tool)
      ? tones.filter((t) => !['Neutral', 'Polite'].includes(t))
      : ['Clear', 'Professional', 'Warm', 'Polite', 'Minimal']
  );
  const canSubmit = $derived(!busy && (isByok || remaining !== 0));

  function toggleTone(t: string) {
    if (brief.tones.includes(t)) {
      if (brief.tones.length > 1) {
        brief.tones = brief.tones.filter((x) => x !== t);
      }
    } else {
      if (brief.tones.length < 4) {
        brief.tones = [...brief.tones, t];
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSubmit) onsubmit?.();
    }
  }
</script>

<section class="generator">
  <div class="panel-heading">
    <span class="step-tag">01 / THE BRIEF</span>
    <span class="little-note">
      {isByok
        ? `BYOK Active: ${byokProvider || 'Custom'} (Unlimited)`
        : brief.tool === 'summarize'
          ? 'Facts first. Fluff last.'
          : 'A little direction goes a long way.'}
    </span>
  </div>

  <div
    class="micro-task-disclaimer"
    style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; margin-bottom: 14px; border-radius: 10px; background: var(--surface-muted, rgba(255,255,255,0.04)); border: 1px solid var(--border, rgba(255,255,255,0.1)); fontSize: 12px; color: var(--foreground-muted, #a1a1aa); line-height: 1.4;"
    role="note"
  >
    <span style="font-size: 16px;">⚡</span>
    <span>
      <strong>Quickie Micro-Tasks:</strong> Inputs have tight character limits by design to ensure sub-second AI speed, zero timeouts, and minimal token cost. For long essays or back-and-forth chat, standard chat tools are better suited.
    </span>
  </div>

  <form onkeydown={handleKeydown} onsubmit={(e) => { e.preventDefault(); onsubmit?.(); }}>
    <fieldset disabled={busy} class="brief-fields">
      <h2>
        <label for="idea">{label}</label>
      </h2>
      <textarea
        id="idea"
        class="brief-input"
        bind:value={brief.idea}
        maxlength={inputLimit(brief.tool, authenticated)}
        placeholder={toolCatalog.find((t) => t.id === brief.tool)?.example}
        required
        minlength="3"
      ></textarea>

      <div class="input-meta">
        <span class="starter-caption">Need a spark?</span>
        <span>{brief.idea.length.toLocaleString()} / {inputLimit(brief.tool, authenticated).toLocaleString()}</span>
      </div>

      <div class="starter-chips">
        {#each starters[brief.tool] as sample, i (sample.label)}
          <button type="button" onclick={() => loadSample(i)}>
            <Sparkles size={12} />
            {sample.label}
          </button>
        {/each}
      </div>

      {#if previous && previous.tool === brief.tool}
        <button class="undo-example" type="button" onclick={undoSample}>
          Undo example
        </button>
      {/if}

      <label class="form-label">
        {brief.tool === 'reply'
          ? 'Verified facts & what should happen next'
          : brief.tool === 'summarize'
            ? 'Focus on (optional)'
            : brief.tool === 'tagline'
              ? 'What makes it different? (optional)'
              : 'Context or instructions (optional)'}
        <textarea
          class="brief-context"
          bind:value={brief.context}
          maxlength="400"
          placeholder={brief.tool === 'reply'
            ? 'What can you confirm? What should the recipient do next?'
            : 'What must stay, what to avoid, or what matters most…'}
        ></textarea>
        <div style="display: flex; justify-content: flex-end; font-size: 11px; opacity: 0.7; margin-top: 2px;">
          <span>{brief.context.length} / 400</span>
        </div>
      </label>

      <div class="writing-settings">
        {#if brief.tool !== 'summarize'}
          <label>
            Audience
            <input
              bind:value={brief.audience}
              maxlength="120"
              placeholder="Who is this for?"
            />
          </label>
        {/if}

        {#if ['rewrite', 'social'].includes(brief.tool)}
          <label>
            {brief.tool === 'rewrite' ? 'Purpose' : 'Objective'}
            <input
              bind:value={brief.purpose}
              maxlength="150"
              placeholder={brief.tool === 'rewrite' ? 'Explain, persuade, clarify…' : 'Announce, invite, drive a click…'}
            />
          </label>
        {/if}

        {#if brief.tool === 'reply'}
          <label>
            Reply channel
            <select bind:value={brief.channel}>
              <option value="email">Email</option>
              <option value="support">Support ticket</option>
              <option value="chat">Chat message</option>
            </select>
          </label>
        {/if}

        {#if brief.tool === 'social'}
          <label>
            Platform
            <select bind:value={brief.channel}>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X · 280 characters/caption</option>
            </select>
          </label>
        {/if}

        {#if brief.tool === 'headlines'}
          <label>
            Type
            <select bind:value={brief.channel}>
              <option value="headline">Headline · up to 110 characters</option>
              <option value="subject">Email subject · up to 70 characters</option>
            </select>
          </label>
        {/if}

        {#if brief.tool === 'tagline'}
          <label>
            Tagline length
            <select bind:value={brief.length}>
              <option value="punchy">Punchy · up to 5 words each</option>
              <option value="balanced">Balanced · up to 10 words each</option>
              <option value="descriptive">Descriptive · up to 16 words each</option>
            </select>
          </label>
        {/if}

        {#if !isDocument(brief.tool)}
          <label>
            Number of {brief.tool === 'social' ? 'captions' : 'ideas'}
            <select bind:value={brief.count}>
              {#each countOptions(brief.tool, authenticated) as n}
                <option value={n}>{n} {brief.tool === 'social' ? 'captions' : 'ideas'}</option>
              {/each}
            </select>
          </label>
        {/if}

        {#if !card}
          <label>
            {brief.tool === 'summarize' ? 'Detail level' : 'Output length'}
            <select bind:value={brief.length}>
              <option value="short">{brief.tool === 'summarize' ? 'Brief' : 'Short'}</option>
              <option value="standard">{brief.tool === 'summarize' ? 'Balanced' : 'Standard'}</option>
              <option value="detailed">Detailed</option>
              <option value="custom">Custom word target</option>
            </select>
          </label>

          {#if brief.length === 'custom'}
            <label>
              Maximum words (total)
              <input type="number" min="20" max={cap} bind:value={brief.maxWords} />
            </label>
          {/if}

          <label>
            Output format
            <select bind:value={brief.format}>
              <option value="plain">Plain text</option>
              <option value="markdown">Markdown</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
        {/if}

        {#if brief.tool === 'rewrite'}
          <label>
            Compared with the original
            <select bind:value={brief.rewriteSize}>
              <option value="shorter">Shorter</option>
              <option value="similar">Similar length</option>
              <option value="longer">Expand slightly</option>
            </select>
          </label>
        {/if}

        {#if brief.tool === 'summarize'}
          <label>
            Structure
            <select bind:value={brief.structure}>
              <option value="paragraph">Paragraph</option>
              <option value="bullets">Bullet points</option>
            </select>
          </label>
        {/if}

        {#if authenticated}
          <label>
            Project (optional)
            <input bind:value={brief.project} maxlength="80" list="project-options" />
            <datalist id="project-options">
              {#each projects as p}
                <option value={p}></option>
              {/each}
            </datalist>
          </label>
        {/if}
      </div>

      {#if brief.tool === 'social'}
        <label class="check-label">
          <input type="checkbox" bind:checked={brief.hashtags} />
          Include relevant hashtags
        </label>
      {/if}

      {#if brief.tool !== 'summarize'}
        <details class="tone-options" open={!isDocument(brief.tool)}>
          <summary>Tone · {brief.tones.join(' + ')}</summary>
          <div class="tones">
            {#each availableTones as t}
              <button
                type="button"
                aria-pressed={brief.tones.includes(t)}
                class={brief.tones.includes(t) ? 'selected' : ''}
                onclick={() => toggleTone(t)}
              >
                {t}
              </button>
            {/each}
          </div>
        </details>
      {/if}

      {#if creativeTool(brief.tool)}
        <div class="chaos-field">
          <div class="field-title">
            <h3>Creative freedom</h3>
            <span>{brief.chaos <= 3 ? 'Grounded' : brief.chaos <= 6 ? 'Playful' : 'Adventurous'}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            bind:value={brief.chaos}
            class="w-full h-2 bg-gradient-to-r from-[#d7e9a3] via-[#dcdda0] to-[#e1ba6b] rounded-lg appearance-none cursor-pointer accent-[#a4cd27]"
            aria-label="Creative freedom"
          />
          <div class="slider-labels">
            <span>Keep it practical</span>
            <span>Surprise me</span>
          </div>
        </div>
      {/if}

      {#if ['reply', 'social'].includes(brief.tool)}
        <details class="advanced-options">
          <summary>Advanced: explicit line limit</summary>
          <label class="form-label">
            Maximum lines · 0 means automatic
            <input type="number" min="0" max={authenticated ? 50 : 20} bind:value={brief.maxLines} />
          </label>
          <p class="setting-hint">Optional line breaks, not wrapping on your screen. Applies across the entire response.</p>
        </details>
      {/if}

      <p class="setting-hint">
        {card
          ? 'Each idea has its own short length limit.'
          : brief.tool === 'summarize'
            ? 'Summaries stay shorter than your source.'
            : `Up to ${cap} words across the response.`}
        {brief.tool === 'rewrite' ? ' The original length and your preference guide the result.' : ''}
      </p>
    </fieldset>

    <button class="primary-button generate-main" type="submit" disabled={!canSubmit}>
      <Sparkles size={18} />
      <span>
        {busy
          ? 'Working on your words…'
          : isByok
            ? `Generate ${brief.tool === 'tagline' ? 'taglines' : brief.tool === 'headlines' ? 'ideas' : brief.tool === 'social' ? 'captions' : brief.tool === 'reply' ? 'reply' : brief.tool === 'summarize' ? 'summary' : 'rewrite'} · BYOK Unlimited`
            : `Generate ${brief.tool === 'tagline' ? 'taglines' : brief.tool === 'headlines' ? 'ideas' : brief.tool === 'social' ? 'captions' : brief.tool === 'reply' ? 'reply' : brief.tool === 'summarize' ? 'summary' : 'rewrite'} · 1 credit`}
      </span>
      <ArrowUpRight size={19} />
    </button>
    <p class="keyboard-hint">
      <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>Enter</kbd> to generate
    </p>
  </form>
</section>
