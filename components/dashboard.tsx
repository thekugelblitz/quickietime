"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-location-assign-relative-destination -- Full document navigation is intentional across the studio/dashboard boundary. */
import {MobileIsland} from './mobile-island';
import {ThemeToggle} from './theme-toggle';
import { downloadCard } from '@/lib/share';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { toolCatalog, type Entry, type Result } from '@/lib/config';
import { copyText } from '@/lib/clipboard';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Sparkles, Key, Download, Code, Eye, EyeOff, Zap } from 'lucide-react';

async function api<T = { ok: boolean }>(path: string, method = 'GET', body?: unknown) {
  const response = await fetch('/api/' + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || 'Could not load your work.');
  return data;
}

type ByokState = {
  configured: boolean;
  provider: string;
  model: string;
  baseUrl: string;
  enabled: boolean;
  maskedKey: string;
};

export function Dashboard({ name }: { name: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [favorites, setFavorites] = useState<Result[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(20);
  const [paidCredits, setPaidCredits] = useState(0);
  const [total, setTotal] = useState(0);
  const [projects, setProjects] = useState<string[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [projectDialog, setProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [renameFrom, setRenameFrom] = useState('');
  const [versions, setVersions] = useState<Entry[]>([]);
  const sequence = useRef(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [tool, setTool] = useState('all');
  const [project, setProject] = useState('all');
  const [view, setView] = useState<'history' | 'favorites' | 'projects' | 'byok' | 'widgets'>('history');
  const [open, setOpen] = useState<Entry | null>(null);
  const [move, setMove] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // BYOK State
  const [byok, setByok] = useState<ByokState>({
    configured: false,
    provider: 'openai',
    model: '',
    baseUrl: '',
    enabled: true,
    maskedKey: ''
  });
  const [byokKeyInput, setByokKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testingByok, setTestingByok] = useState(false);

  // Widget preview state
  const [widgetProject, setWidgetProject] = useState('all');
  const [widgetTheme, setWidgetTheme] = useState<'auto' | 'dark' | 'light'>('dark');
  const [copiedSnippet, setCopiedSnippet] = useState('');

  const load = useCallback(async (next = 0) => {
    const run = ++sequence.current;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(next), q: query, tool, project, from, to });
      const [h, u, f, p, b] = await Promise.all([
        api<{ entries: Entry[]; hasMore: boolean; total: number }>('history?' + params),
        api<{ remaining: number; limit: number; paidCredits?: number }>('usage'),
        api<{ results: Result[] }>('favorites'),
        api<{ projects: string[] }>('projects'),
        api<ByokState>('byok').catch(() => ({ configured: false, provider: 'openai', model: '', baseUrl: '', enabled: true, maskedKey: '' }))
      ]);
      if (run !== sequence.current) return;
      setTotal(h.total);
      setProjects(p.projects);
      setEntries(old => (next ? [...old, ...h.entries] : h.entries));
      setHasMore(h.hasMore);
      setPage(next);
      setRemaining(u.remaining);
      setLimit(u.limit);
      setPaidCredits(u.paidCredits || 0);
      setFavorites(f.results);
      if (b.configured) {
        setByok(b);
      }
    } catch (e) {
      if (run === sequence.current) setError((e as Error).message);
    } finally {
      if (run === sequence.current) setLoading(false);
    }
  }, [query, tool, project, from, to]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  async function manageProject() {
    if (!projectName.trim()) return;
    setSaving(true);
    try {
      await api('projects', renameFrom ? 'PATCH' : 'POST', renameFrom ? { from: renameFrom, to: projectName } : { name: projectName });
      setProjectDialog(false);
      if (project === renameFrom) setProject(projectName);
      await load();
      toast.success(renameFrom ? 'Project renamed.' : 'Project created.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function openWork(e: Entry) {
    setOpen(e);
    setMove(e.brief.project || '');
    setVersions([]);
    try {
      const data = await api<{ entries: Entry[] }>('history?root=' + encodeURIComponent(e.rootId || e.id));
      setVersions(data.entries);
    } catch {
      toast.error('Could not load earlier versions.');
    }
  }

  async function copy(text: string) {
    try {
      await copyText(text);
      toast.success('Copied.');
    } catch {
      toast.error('Select the text to copy it.');
    }
  }

  async function shareCard(result: Result) {
    try {
      await downloadCard(result.text, result.id);
      toast.success('Share card downloaded.');
    } catch {
      toast.error('Could not create the share card. Please try again.');
    }
  }

  function triggerExport(format: 'csv' | 'json' | 'txt') {
    const params = new URLSearchParams({ format, project });
    window.open('/api/export?' + params.toString(), '_blank');
    toast.success(`Exporting as ${format.toUpperCase()}…`);
  }

  async function saveProject() {
    if (!open) return;
    setSaving(true);
    try {
      const data = await api<{ entry: Entry }>('history', 'PATCH', { id: open.id, project: move });
      setEntries(es => es.map(e => (e.id === open.id ? data.entry : e)));
      setOpen(data.entry);
      toast.success('Project updated.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setSaving(true);
    try {
      await api('history?id=' + encodeURIComponent(deleting), 'DELETE');
      setEntries(es => es.filter(e => e.id !== deleting));
      setOpen(null);
      setDeleting(null);
      toast.success('Removed from history.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveByokConfig() {
    setSaving(true);
    try {
      await api('byok', 'POST', {
        provider: byok.provider,
        apiKey: byokKeyInput.trim() || undefined,
        model: byok.model.trim() || undefined,
        baseUrl: byok.baseUrl.trim() || undefined,
        enabled: byok.enabled
      });
      setByokKeyInput('');
      toast.success('BYOK settings saved securely.');
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function testByokConnection() {
    setTestingByok(true);
    try {
      const res = await api<{ ok: boolean; message: string; sample?: string }>('byok/test', 'POST', {
        provider: byok.provider,
        apiKey: byokKeyInput.trim() || undefined,
        model: byok.model.trim() || undefined,
        baseUrl: byok.baseUrl.trim() || undefined
      });
      toast.success(res.message || 'Connection successful!');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setTestingByok(false);
    }
  }

  async function removeByok() {
    setSaving(true);
    try {
      await api('byok', 'DELETE');
      setByok({
        configured: false,
        provider: 'openai',
        model: '',
        baseUrl: '',
        enabled: true,
        maskedKey: ''
      });
      setByokKeyInput('');
      toast.success('BYOK key removed.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function copyCode(code: string, label: string) {
    copy(code);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(''), 3000);
  }

  const wpSnippet = `<?php
/**
 * Plugin Name: QuickieTime Hello Dolly
 * Description: Displays random QuickieTime taglines in the WordPress admin bar.
 * Version: 1.0.0
 * Author: QuickieTime
 */
function quickietime_admin_notice() {
    $response = wp_remote_get('https://qtai.click/api/v1/widget?format=text${widgetProject !== 'all' ? '&project=' + encodeURIComponent(widgetProject) : ''}');
    if (!is_wp_error($response)) {
        $quote = trim(wp_remote_retrieve_body($response));
        if ($quote) {
            echo "<div style='float:right;padding:6px 12px;margin:5px;font-size:13px;font-weight:500;color:#2563eb;background:#eff6ff;border-radius:6px;'>⚡ " . esc_html($quote) . "</div>";
        }
    }
}
add_action('admin_notices', 'quickietime_admin_notice');
`;

  const htmlSnippet = `<script src="https://qtai.click/widget.js"${widgetProject !== 'all' ? ` data-project="${widgetProject}"` : ''} data-theme="${widgetTheme}"></script>`;

  return (
    <>
      <Toaster />
      <header className="site-header">
        <a className="brand" href="/">ϟ QuickieTime</a>
        <nav>
          <a href="/">⚡ Writing Studio</a>
          <a href="/billing">Billing</a>
          <ThemeToggle />
          <a href="/account">Account & Sign out</a>
        </nav>
      </header>
      <MobileIsland authenticated />

      <main className="dashboard">
        <div className="dashboard-heading">
          <div>
            <span className="step-tag">CREATIVE STUDIO & COMMAND CENTER</span>
            <h1>Good work. Kept together.</h1>
            <p>{name}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a className="primary-button" href="/">Create something →</a>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div>
            <strong>{remaining === null ? '—' : remaining}</strong>
            <span>credits available · {limit} free daily + {paidCredits} purchased</span>
          </div>
          <div>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {byok.configured && byok.enabled ? (
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={18} fill="currentColor" /> BYOK Unlimited
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={18} /> Cloud Credits
                </span>
              )}
            </strong>
            <span>Active Engine · {byok.configured && byok.enabled ? `${byok.provider.toUpperCase()} (0 credits charged)` : 'Platform AI'}</span>
          </div>
          <div>
            <strong>{total}</strong>
            <span>matching saved versions</span>
          </div>
          <div>
            <strong>{projects.length}</strong>
            <span>organized projects</span>
          </div>
        </div>

        {/* Toolbar Tabs */}
        <div className="dashboard-toolbar" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button aria-pressed={view === 'history'} onClick={() => setView('history')}>📚 All work</button>
          <button aria-pressed={view === 'favorites'} onClick={() => setView('favorites')}>❤️ Favorites ({favorites.length})</button>
          <button aria-pressed={view === 'projects'} onClick={() => setView('projects')}>📁 Projects ({projects.length})</button>
          <button aria-pressed={view === 'byok'} onClick={() => setView('byok')}>
            🔑 BYOK & Engines {byok.configured && byok.enabled && <span style={{ marginLeft: '4px', fontSize: '11px', color: '#10b981' }}>● Active</span>}
          </button>
          <button aria-pressed={view === 'widgets'} onClick={() => setView('widgets')}>🧩 Widget & Exports</button>
          <button onClick={() => { setProjectName(''); setRenameFrom(''); setProjectDialog(true); }}>+ New project</button>
        </div>

        {/* View: All Work / History */}
        {view === 'history' && (
          <>
            <div className="dashboard-filters">
              <label>
                Search input or output
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search all saved input and output…" />
              </label>
              <label>
                Tool
                <select value={tool} onChange={e => setTool(e.target.value)}>
                  <option value="all">All tools</option>
                  {toolCatalog.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label>
                Project
                <select value={project} onChange={e => setProject(e.target.value)}>
                  <option value="all">All projects</option>
                  <option value="Unfiled">Unfiled</option>
                  {projects.map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label>
                From date
                <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
              </label>
              <label>
                Through date
                <input type="date" value={to} onChange={e => setTo(e.target.value)} />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 10px 0' }}>
              <p className="setting-hint" style={{ margin: 0 }}>
                Search covers your complete saved history. Open an item to continue editing, see versions, or export.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => triggerExport('csv')} className="secondary-button" style={{ padding: '6px 12px', fontSize: '12px' }}>Export CSV</button>
                <button onClick={() => triggerExport('json')} className="secondary-button" style={{ padding: '6px 12px', fontSize: '12px' }}>Export JSON</button>
                <button onClick={() => triggerExport('txt')} className="secondary-button" style={{ padding: '6px 12px', fontSize: '12px' }}>Export TXT</button>
              </div>
            </div>

            {error && <div className="error" role="alert">{error}<button onClick={() => void load()}>Retry</button></div>}

            <div className="dashboard-grid">
              {entries.map(e => (
                <button className="saved-work" key={e.id} onClick={() => void openWork(e)} style={{ textAlign: 'left', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="step-tag">{e.brief.tool || 'tagline'} · {e.brief.project || 'Unfiled'}</span>
                    {e.byok && <span style={{ fontSize: '10px', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px' }}>BYOK: {e.provider || 'Custom'}</span>}
                  </div>
                  <h2>{e.title || e.brief.idea.slice(0, 70)}</h2>
                  <p>{e.results[0]?.text}</p>
                  <small>{new Date(e.createdAt).toLocaleString()} · {e.kind || 'generation'} · {e.results.length} result(s)</small>
                </button>
              ))}
            </div>

            {!entries.length && !loading && (
              <div className="empty">
                <h2>{query ? 'Nothing matches those filters.' : 'Your ideas live here.'}</h2>
                <p>Create a Quickie to start your first project.</p>
                <a href="/">Open the writing tools →</a>
              </div>
            )}

            {hasMore && (
              <button className="another" disabled={loading} onClick={() => void load(page + 1)}>
                Load older work
              </button>
            )}
          </>
        )}

        {/* View: Favorites */}
        {view === 'favorites' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter favorites…"
                style={{ maxWidth: '360px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => triggerExport('csv')} className="secondary-button" style={{ padding: '6px 12px', fontSize: '12px' }}>Export CSV</button>
                <button onClick={() => triggerExport('json')} className="secondary-button" style={{ padding: '6px 12px', fontSize: '12px' }}>Export JSON</button>
              </div>
            </div>

            <div className="dashboard-grid">
              {favorites.filter(r => r.text.toLowerCase().includes(query.toLowerCase())).map(r => (
                <article className="saved-work" key={r.id}>
                  <p className="content-output">{r.text}</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <button onClick={() => void copy(r.text)}>Copy</button>
                    <button onClick={() => void shareCard(r)}>Download share card</button>
                    <button onClick={async () => {
                      try {
                        await api('favorites/' + r.id, 'DELETE');
                        setFavorites(fs => fs.filter(f => f.id !== r.id));
                        toast.success('Removed favorite.');
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}>Remove</button>
                  </div>
                </article>
              ))}
            </div>
            {!favorites.length && <p>No favorites yet. Save a result with its heart button in the studio.</p>}
          </>
        )}

        {/* View: Projects */}
        {view === 'projects' && (
          <div className="dashboard-grid">
            {projects.map(p => (
              <article className="saved-work" key={p} style={{ padding: '20px' }}>
                <h2>📁 {p}</h2>
                <p className="setting-hint">Organized collection of drafts and versions.</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button onClick={() => { setProject(p); setQuery(''); setTool('all'); setFrom(''); setTo(''); setView('history'); }}>
                    Open project
                  </button>
                  <button onClick={() => { setRenameFrom(p); setProjectName(p); setProjectDialog(true); }}>
                    Rename
                  </button>
                </div>
              </article>
            ))}
            {!projects.length && <p>Create a project to organize your next drafts.</p>}
          </div>
        )}

        {/* View: BYOK Settings */}
        {view === 'byok' && (
          <section className="byok-center" style={{ maxWidth: '720px', margin: '0 auto', background: 'var(--surface-muted, rgba(255,255,255,0.03))', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Key size={24} style={{ color: '#3b82f6' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Bring Your Own Key (BYOK)</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
                  Generate unlimited everything with 0 credit deduction using your personal API key.
                </p>
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '10px', background: byok.configured && byok.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.08)', border: '1px solid ' + (byok.configured && byok.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.2)'), marginBottom: '20px' }}>
              <strong style={{ display: 'block', fontSize: '14px', color: byok.configured && byok.enabled ? '#10b981' : '#3b82f6' }}>
                {byok.configured && byok.enabled ? '⚡ BYOK Mode Active: Unlimited Generations' : 'ϟ QuickieTime Cloud Credits Active'}
              </strong>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>
                {byok.configured && byok.enabled
                  ? `Your requests are routed through ${byok.provider.toUpperCase()}. Platform credits will NOT be deducted.`
                  : 'Currently using your daily & purchased credits from QuickieTime platform AI.'}
              </span>
            </div>

            <form onSubmit={e => { e.preventDefault(); void saveByokConfig(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label className="form-label">
                AI Provider
                <select
                  value={byok.provider}
                  onChange={e => setByok(b => ({ ...b, provider: e.target.value }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface, #111)', color: 'inherit' }}
                >
                  <option value="openai">OpenAI (gpt-4o-mini, gpt-4o)</option>
                  <option value="claude">Anthropic Claude (claude-3-5-haiku)</option>
                  <option value="openrouter">OpenRouter (Any model)</option>
                  <option value="cheaperinference">CheaperInference</option>
                  <option value="replicate">Replicate</option>
                  <option value="custom">Custom / OpenAI-Compatible (Groq, Together, Ollama)</option>
                </select>
              </label>

              <label className="form-label">
                API Key
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={byokKeyInput}
                    onChange={e => setByokKeyInput(e.target.value)}
                    placeholder={byok.configured ? `Configured (${byok.maskedKey}) · Leave blank to keep` : 'Paste your API key here (sk-…)'}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface, #111)', color: 'inherit' }}
                  />
                  <button type="button" onClick={() => setShowKey(!showKey)} className="secondary-button" style={{ padding: '10px' }} title={showKey ? 'Hide key' : 'Show key'}>
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <small className="setting-hint">Your API key is encrypted using AES-256-GCM and never shown in plain text.</small>
              </label>

              <label className="form-label">
                Model Name (Optional)
                <input
                  type="text"
                  value={byok.model}
                  onChange={e => setByok(b => ({ ...b, model: e.target.value }))}
                  placeholder={byok.provider === 'claude' ? 'claude-3-5-haiku-20241022' : byok.provider === 'openrouter' ? 'openai/gpt-4o-mini' : byok.provider === 'cheaperinference' ? 'gpt-5.6-luna' : 'gpt-4o-mini'}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface, #111)', color: 'inherit' }}
                />
                <small className="setting-hint">Leave blank for the provider&apos;s fastest, recommended default.</small>
              </label>

              {byok.provider === 'custom' && (
                <label className="form-label">
                  Custom Base URL
                  <input
                    type="url"
                    value={byok.baseUrl}
                    onChange={e => setByok(b => ({ ...b, baseUrl: e.target.value }))}
                    placeholder="https://api.groq.com/openai/v1/chat/completions"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface, #111)', color: 'inherit' }}
                  />
                  <small className="setting-hint">Full chat completions endpoint URL.</small>
                </label>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={byok.enabled}
                  onChange={e => setByok(b => ({ ...b, enabled: e.target.checked }))}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Use my BYOK for all writing generations (Unlimited)</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button type="submit" className="primary-button" disabled={saving}>
                  Save BYOK Settings
                </button>
                <button type="button" onClick={() => void testByokConnection()} className="secondary-button" disabled={testingByok || (!byokKeyInput && !byok.configured)}>
                  {testingByok ? 'Testing connection…' : 'Test Connection'}
                </button>
                {byok.configured && (
                  <button type="button" onClick={() => void removeByok()} className="secondary-button" disabled={saving} style={{ color: '#ef4444' }}>
                    Remove Key
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {/* View: Widget & Exports Hub */}
        {view === 'widgets' && (
          <section className="widget-hub" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'var(--surface-muted, rgba(255,255,255,0.03))', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Code size={24} style={{ color: '#3b82f6' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px' }}>WordPress &ldquo;Hello Dolly&rdquo; Style Widget &amp; Embed Studio</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
                    Display your generated taglines, quotes, or tips anywhere — WordPress admin bar, client websites, or custom apps.
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div style={{ margin: '20px 0', padding: '20px', borderRadius: '12px', background: widgetTheme === 'dark' ? '#18181b' : '#f4f4f5', border: '1px dashed var(--border)' }}>
                <span className="step-tag" style={{ marginBottom: '8px', display: 'inline-block' }}>LIVE PREVIEW</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: widgetTheme === 'dark' ? 'rgba(0,0,0,0.4)' : '#ffffff', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>⚡</span>
                    <span style={{ fontWeight: 500, color: widgetTheme === 'dark' ? '#f4f4f5' : '#18181b' }}>
                      Tomorrow can wait. Better coffee now.
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600 }}>⚡ QuickieTime</span>
                </div>
              </div>

              {/* Configuration Controls */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <label style={{ fontSize: '13px' }}>
                  Project Source
                  <select value={widgetProject} onChange={e => setWidgetProject(e.target.value)} style={{ marginLeft: '6px', padding: '6px 10px', borderRadius: '6px' }}>
                    <option value="all">All Saved Snippets</option>
                    {projects.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: '13px' }}>
                  Widget Theme
                  <select value={widgetTheme} onChange={e => setWidgetTheme(e.target.value as typeof widgetTheme)} style={{ marginLeft: '6px', padding: '6px 10px', borderRadius: '6px' }}>
                    <option value="dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                    <option value="auto">Auto (System Theme)</option>
                  </select>
                </label>
              </div>

              {/* Snippet Code Boxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>1. HTML & Web Embed Script (Any Website)</strong>
                    <button className="secondary-button" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => copyCode(htmlSnippet, 'html')}>
                      {copiedSnippet === 'html' ? '✓ Copied!' : 'Copy Embed Script'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', overflowX: 'auto', fontSize: '12px', color: '#e4e4e7' }}>
                    <code>{htmlSnippet}</code>
                  </pre>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>2. WordPress Hello Dolly Plugin / functions.php Snippet</strong>
                    <button className="secondary-button" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => copyCode(wpSnippet, 'wp')}>
                      {copiedSnippet === 'wp' ? '✓ Copied!' : 'Copy WordPress Code'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', overflowX: 'auto', fontSize: '12px', color: '#e4e4e7' }}>
                    <code>{wpSnippet}</code>
                  </pre>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>3. Public REST API Endpoint (Plain Text or JSON)</strong>
                    <button className="secondary-button" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => copyCode(`https://qtai.click/api/v1/widget?format=text${widgetProject !== 'all' ? '&project=' + encodeURIComponent(widgetProject) : ''}`, 'api')}>
                      {copiedSnippet === 'api' ? '✓ Copied!' : 'Copy API URL'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', overflowX: 'auto', fontSize: '12px', color: '#e4e4e7' }}>
                    <code>https://qtai.click/api/v1/widget?format=text{widgetProject !== 'all' ? `&project=${encodeURIComponent(widgetProject)}` : ''}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Instant Full Data Exports */}
            <div style={{ background: 'var(--surface-muted, rgba(255,255,255,0.03))', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Download size={24} style={{ color: '#10b981' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px' }}>Direct Data Exports</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
                    Export your complete creative library or filtered project data in universal formats.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <button className="primary-button" onClick={() => triggerExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} /> Download CSV (Spreadsheet)
                </button>
                <button className="primary-button" onClick={() => triggerExport('json')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} /> Download JSON (Complete)
                </button>
                <button className="primary-button" onClick={() => triggerExport('txt')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} /> Download Formatted TXT
                </button>
              </div>
            </div>
          </section>
        )}

        {loading && <p role="status">Loading your creative corner…</p>}
      </main>

      {/* Work Detail Dialog */}
      <Dialog open={!!open} onOpenChange={v => { if (!v) setOpen(null); }}>
        <DialogContent className="work-dialog">
          <DialogTitle>{open?.title || 'Saved Quickie'}</DialogTitle>
          {open && (
            <div className="history-scroll">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="step-tag">{open.brief.tool || 'tagline'} · {open.brief.project || 'Unfiled'}</span>
                {open.byok && <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>⚡ BYOK: {open.provider || 'Custom'}</span>}
              </div>
              <h3>Original input</h3>
              <p className="content-output">{open.brief.idea}</p>
              {open.brief.context && <p>Context: {open.brief.context}</p>}
              <p className="setting-hint">{open.brief.tones.join(' · ')} · {open.brief.format || 'plain'}</p>
              <div className="writing-settings">
                <label>
                  Project
                  <input value={move} onChange={e => setMove(e.target.value)} maxLength={80} list="projects" />
                  <datalist id="projects">{projects.filter(p => p !== 'Unfiled').map(p => <option key={p} value={p} />)}</datalist>
                </label>
                <button disabled={saving} onClick={() => void saveProject()}>Save project</button>
              </div>
              {open.results.map(r => (
                <article className="saved-output" key={r.id}>
                  <p className="content-output">{r.text}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button onClick={() => void copy(r.text)}>Copy output</button>
                    <button onClick={() => void shareCard(r)}>Download share card</button>
                  </div>
                </article>
              ))}
              <div className="dashboard-toolbar">
                <button onClick={() => {
                  try {
                    sessionStorage.setItem('qt-continue', JSON.stringify(open));
                    window.location.assign('/');
                  } catch {
                    toast.error('Could not open this draft.');
                  }
                }}>
                  Continue editing
                </button>
                <button onClick={() => {
                  try {
                    sessionStorage.setItem('qt-reuse', JSON.stringify(open.brief));
                    window.location.assign('/');
                  } catch {
                    toast.error('Browser storage is unavailable.');
                  }
                }}>
                  Reuse input & settings
                </button>
                <button onClick={() => setDeleting(open.id)}>Delete from history</button>
              </div>
              <h3>Version history</h3>
              {versions.map(v => (
                <button key={v.id} className="history-entry" onClick={() => { setOpen(v); setMove(v.brief.project || ''); }}>
                  <span>{v.kind || 'generation'} · {new Date(v.createdAt).toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Creation/Rename Dialog */}
      <Dialog open={projectDialog} onOpenChange={setProjectDialog}>
        <DialogContent>
          <DialogTitle>{renameFrom ? 'Rename project' : 'Create a project'}</DialogTitle>
          <label className="form-label">
            Project name
            <input value={projectName} maxLength={80} onChange={e => setProjectName(e.target.value)} />
          </label>
          <button className="primary-button" disabled={saving || !projectName.trim()} onClick={() => void manageProject()}>
            Save project
          </button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this generation?</AlertDialogTitle>
          <AlertDialogDescription>This removes it from your cloud history. Saved favorites are kept.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={e => { e.preventDefault(); void remove(); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
