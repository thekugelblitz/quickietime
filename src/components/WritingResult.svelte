<script lang="ts">
  import { Copy, Heart, MoreHorizontal } from 'lucide-svelte';
  import { type Result, type Brief, allowedActions, isDocument, wordCount } from '@/lib/config';
  import FormattedText from './FormattedText.svelte';
  import { convertFormat } from '@/components/formatted-text';
  import { copyText } from '@/lib/clipboard';
  import { downloadText } from '@/lib/client';
  import { downloadCard } from '@/lib/share';
  import { toast } from '@/src/lib/toast.svelte';

  let {
    result,
    brief,
    index,
    saved = false,
    busy = false,
    onfavorite,
    ontransform,
    onsave,
  } = $props<{
    result: Result;
    brief: Brief;
    index: number;
    saved?: boolean;
    busy?: boolean;
    onfavorite?: () => void;
    ontransform?: (action: string) => void;
    onsave?: (text: string, format: Brief['format']) => Promise<void>;
  }>();

  let text = $state(result.text);
  let format = $state<Brief['format']>(brief.format);
  let editing = $state(false);
  let saving = $state(false);
  let menuOpen = $state(false);

  $effect(() => {
    text = result.text;
    format = brief.format;
  });

  const document = $derived(isDocument(brief.tool));
  const dirty = $derived(text !== result.text || format !== brief.format);

  async function copy() {
    try {
      await copyText(text);
      toast.success('Copied. Formatting preserved.');
    } catch {
      toast.error('Select the output to copy it.');
    }
  }

  async function save() {
    saving = true;
    try {
      await onsave?.(text, format);
      editing = false;
      toast.success('Saved new version.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      saving = false;
    }
  }

  async function exportShareCard() {
    try {
      await downloadCard(text, result.id);
      toast.success('Share card downloaded.');
    } catch {
      toast.error('Could not create share card.');
    }
  }

  function shareText() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      copy();
    }
  }
</script>

<article class={`result-card ${document ? 'document-card' : 'idea-card'}`}>
  <div class="result-top">
    <span class="result-number">{document ? 'YOUR DRAFT' : String(index + 1).padStart(2, '0')}</span>
    <div style="display: flex; gap: 3px; align-items: center; position: relative;">
      <button type="button" class="icon-button" aria-label="Copy output" onclick={copy}>
        <Copy size={18} />
      </button>
      <button
        type="button"
        class={`icon-button ${saved ? 'saved' : ''}`}
        disabled={dirty}
        aria-label={saved ? 'Remove favorite' : 'Save favorite'}
        aria-pressed={saved}
        onclick={onfavorite}
      >
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <div style="position: relative;">
        <button
          type="button"
          class="icon-button"
          aria-label="More result actions"
          onclick={() => (menuOpen = !menuOpen)}
        >
          <MoreHorizontal size={18} />
        </button>
        {#if menuOpen}
          <div class="fixed inset-0 z-40" onclick={() => (menuOpen = false)}></div>
          <div
            class="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1.5 shadow-xl text-sm"
          >
            <button
              type="button"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--muted)]"
              onclick={() => {
                menuOpen = false;
                downloadText(text, format === 'markdown' ? 'quickietime.md' : 'quickietime.txt');
              }}
            >
              Download text
            </button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--muted)]"
              onclick={() => {
                menuOpen = false;
                exportShareCard();
              }}
            >
              Download share card
            </button>
            <button
              type="button"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--muted)]"
              onclick={() => {
                menuOpen = false;
                shareText();
              }}
            >
              Share text
            </button>
            <div class="my-1 border-t border-[var(--border)]"></div>
            {#each allowedActions(brief.tool) as a}
              <button
                type="button"
                disabled={busy || dirty}
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--muted)] disabled:opacity-50"
                onclick={() => {
                  menuOpen = false;
                  ontransform?.(a);
                }}
              >
                {a} · 1 credit
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if editing}
    <textarea
      class="draft-editor"
      aria-label="Edit draft"
      bind:value={text}
      maxlength="8000"
    ></textarea>
  {:else if document || brief.tool === 'social'}
    <FormattedText {text} {format} />
  {:else}
    <h3>{text}</h3>
  {/if}

  <div class="draft-meta">
    <span>{wordCount(text)} words · {text.length} characters</span>
    <span>{brief.tool === 'headlines' && brief.channel === 'subject' ? 'Email subject' : result.style.join(' · ')}</span>
  </div>

  <div class="draft-actions">
    <button type="button" onclick={() => (editing = !editing)}>
      {editing ? 'Preview' : 'Edit text · free'}
    </button>
    {#if document || brief.tool === 'social'}
      <label>
        Format
        <select
          aria-label="Draft format"
          value={format}
          onchange={(e) => {
            const next = (e.target as HTMLSelectElement).value as Brief['format'];
            text = convertFormat(text, format, next);
            format = next;
          }}
        >
          <option value="plain">Plain</option>
          <option value="markdown">Markdown</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </label>
    {/if}
    <button type="button" onclick={copy}>
      Copy {format === 'plain' ? 'text' : 'formatted text'}
    </button>
    {#if dirty}
      <button type="button" disabled={saving || !text.trim()} onclick={save}>
        {saving ? 'Saving…' : 'Save new version · free'}
      </button>
      <button
        type="button"
        onclick={() => {
          text = result.text;
          format = brief.format;
          editing = false;
        }}
      >
        Discard edits
      </button>
    {/if}
  </div>

  {#if dirty}
    <p class="setting-hint">Save this version before generating alternatives or favoriting.</p>
  {/if}
  {#if format !== 'plain'}
    <p class="setting-hint">Basic formatting preview. Copy preserves the full formatting syntax.</p>
  {/if}

  <div class="result-bottom">
    <button type="button" disabled={busy || dirty} onclick={() => ontransform?.('Make it shorter')}>
      Shorten · 1 credit
    </button>
    {#if brief.tool === 'tagline' || brief.tool === 'social'}
      <button
        type="button"
        class="worse-action"
        disabled={busy || dirty}
        onclick={() => ontransform?.('Make it worse')}
      >
        Make it worse · 1 credit
      </button>
    {:else}
      <button
        type="button"
        disabled={busy || dirty}
        onclick={() => ontransform?.('Make it better')}
      >
        Improve · 1 credit
      </button>
    {/if}
  </div>
</article>
