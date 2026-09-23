<script lang="ts">
  import type { Brief } from '@/lib/config';

  let { text = '', format = 'plain' } = $props<{
    text: string;
    format: Brief['format'];
  }>();

  function formatHtml(raw: string, fmt: Brief['format']): string {
    if (!raw) return '';
    if (fmt === 'plain') {
      return raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
    }
    const lines = raw.split('\n');
    return lines
      .map((line) => {
        let l = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (fmt === 'markdown' && /^#{1,6} /.test(l)) {
          return `<h4>${inline(l.replace(/^#+ /, ''), fmt)}</h4>`;
        }
        if (/^[-*] /.test(l)) {
          return `<div class="preview-bullet">• ${inline(l.slice(2), fmt)}</div>`;
        }
        return `<div>${l ? inline(l, fmt) : '<br/>'}</div>`;
      })
      .join('');
  }

  function inline(s: string, fmt: Brief['format']): string {
    if (fmt === 'whatsapp') {
      return s
        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(/~([^~]+)~/g, '<del>$1</del>');
    }
    return s
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  let rendered = $derived(formatHtml(text, format));
</script>

<div class="formatted-text">
  {@html rendered}
</div>
