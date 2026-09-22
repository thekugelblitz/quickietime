"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-location-assign-relative-destination -- Full document navigation is intentional across the studio/dashboard boundary. */
import {MobileIsland} from './mobile-island';
import { downloadCard } from '@/lib/share';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { toolCatalog, type Entry, type Result } from '@/lib/config';
import { copyText } from '@/lib/clipboard';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
async function api<T = {
    ok: boolean;
}>(path: string, method = 'GET', body?: unknown) { const response = await fetch('/api/' + path, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined }); const data = await response.json() as T & {
    error?: {
        message?: string;
    };
}; if (!response.ok)
    throw new Error(data.error?.message || 'Could not load your work.'); return data; }
export function Dashboard({ name }: {
    name: string;
}) {

    const [entries, setEntries] = useState<Entry[]>([]);
    const [favorites, setFavorites] = useState<Result[]>([]);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [limit, setLimit] = useState(20);
    const [total,setTotal]=useState(0);
    const [projects,setProjects]=useState<string[]>([]);
    const [from,setFrom]=useState('');const [to,setTo]=useState('');
    const [projectDialog,setProjectDialog]=useState(false);const [projectName,setProjectName]=useState('');const [renameFrom,setRenameFrom]=useState('');
    const [versions,setVersions]=useState<Entry[]>([]);
    const sequence=useRef(0);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [tool, setTool] = useState('all');
    const [project, setProject] = useState('all');
    const [view, setView] = useState('history');
    const [open, setOpen] = useState<Entry | null>(null);
    const [move, setMove] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const load=useCallback(async (next = 0) => {const run=++sequence.current;setLoading(true); setError(''); try {
        const params=new URLSearchParams({page:String(next),q:query,tool,project,from,to});
        const [h,u,f,p]=await Promise.all([api<{
                entries: Entry[];
                hasMore: boolean; total:number;
            }>('history?'+params), api<{
                remaining: number;
                limit: number;
            }>('usage'), api<{
                results: Result[];
            }>('favorites'),api<{projects:string[]}>('projects')]);
        if(run!==sequence.current)return;setTotal(h.total);setProjects(p.projects);
        setEntries(old => next ? [...old, ...h.entries] : h.entries);
        setHasMore(h.hasMore);
        setPage(next);
        setRemaining(u.remaining);
        setLimit(u.limit);
        setFavorites(f.results);
    }
    catch (e) {
        if(run===sequence.current)setError((e as Error).message);
    }
    finally {
        if(run===sequence.current)setLoading(false);
    } },[query,tool,project,from,to]);
    useEffect(()=>{const timer=setTimeout(()=>void load(),250);return()=>clearTimeout(timer)},[load]);
    const filtered=entries;
    async function manageProject(){if(!projectName.trim())return;setSaving(true);try{await api('projects',renameFrom?'PATCH':'POST',renameFrom?{from:renameFrom,to:projectName}:{name:projectName});setProjectDialog(false);if(project===renameFrom)setProject(projectName);await load();toast.success(renameFrom?'Project renamed.':'Project created.')}catch(e){toast.error((e as Error).message)}finally{setSaving(false)}}
    async function openWork(e:Entry){setOpen(e);setMove(e.brief.project||'');setVersions([]);try{const data=await api<{entries:Entry[]}>('history?root='+encodeURIComponent(e.rootId||e.id));setVersions(data.entries)}catch{toast.error('Could not load earlier versions.')}}
    async function copy(text: string) { try {
        await copyText(text);
        toast.success('Copied.');
    }
    catch {
        toast.error('Select the text to copy it.');
    } }
    async function shareCard(result:Result){try{await downloadCard(result.text,result.id);toast.success('Share card downloaded.')}catch{toast.error('Could not create the share card. Please try again.')}}
    function download() { const blob = new Blob([JSON.stringify({ entries, favorites }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'quickietime-history.json'; a.click(); URL.revokeObjectURL(url); }
    async function saveProject() { if (!open)
        return; setSaving(true); try {
        const data = await api<{
            entry: Entry;
        }>('history', 'PATCH', { id: open.id, project: move });
        setEntries(es => es.map(e => e.id === open.id ? data.entry : e));
        setOpen(data.entry);
        toast.success('Project updated.');
    }
    catch (e) {
        toast.error((e as Error).message);
    }
    finally {
        setSaving(false);
    } }
    async function remove() { if (!deleting)
        return; setSaving(true); try {
        await api('history?id=' + encodeURIComponent(deleting), 'DELETE');
        setEntries(es => es.filter(e => e.id !== deleting));
        setOpen(null);
        setDeleting(null);
        toast.success('Removed from history.');
    }
    catch (e) {
        toast.error((e as Error).message);
    }
    finally {
        setSaving(false);
    } }
    return <><Toaster /><header className="site-header"><a className="brand" href="/">ϟ QuickieTime</a><nav><a href="/">New Quickie</a><a href="/billing">Billing</a><a href="/account">Account & sign out</a></nav></header><MobileIsland authenticated/><main className="dashboard"><div className="dashboard-heading"><div><span className="step-tag">YOUR CREATIVE CORNER</span><h1>Good work. Kept together.</h1><p>{name}</p></div><a className="primary-button" href="/">Create something →</a></div><div className="dashboard-stats"><div><strong>{remaining === null ? '—' : remaining}</strong><span>credits available · {limit} free daily + purchased</span></div><div><strong>{total}</strong><span>matching saved versions</span></div><div><strong>{projects.length}</strong><span>projects</span></div></div><div className="dashboard-toolbar"><button aria-pressed={view === 'history'} onClick={() => setView('history')}>All work</button><button aria-pressed={view === 'favorites'} onClick={() => setView('favorites')}>Favorites ({favorites.length})</button><button aria-pressed={view==='projects'} onClick={()=>setView('projects')}>Projects</button><button onClick={()=>{setProjectName('');setRenameFrom('');setProjectDialog(true)}}>New project</button><button onClick={download} disabled={!entries.length && !favorites.length}>Export loaded work</button></div>{view!=='projects'&&<div className="dashboard-filters"><label>Search input or output<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search all saved input and output…"/></label><label>Tool<select disabled={view === 'favorites'} value={tool} onChange={e => setTool(e.target.value)}><option value="all">All tools</option>{toolCatalog.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Project<select disabled={view === 'favorites'} value={project} onChange={e => setProject(e.target.value)}><option value="all">All projects</option><option value="Unfiled">Unfiled</option>{projects.map(p => <option key={p}>{p}</option>)}</select></label><label>From date<input type="date" value={from} disabled={view==='favorites'} onChange={e=>setFrom(e.target.value)}/></label><label>Through date<input type="date" value={to} disabled={view==='favorites'} onChange={e=>setTo(e.target.value)}/></label></div>}{error && <div className="error" role="alert">{error}<button onClick={() => void load()}>Retry</button></div>}{view==='projects'?<div className="dashboard-grid">{projects.map(p=><article className="saved-work" key={p}><h2>{p}</h2><button onClick={()=>{setProject(p);setQuery('');setTool('all');setFrom('');setTo('');setView('history')}}>Open project</button><button onClick={()=>{setRenameFrom(p);setProjectName(p);setProjectDialog(true)}}>Rename</button></article>)}{!projects.length&&<p>Create a project to organize your next drafts.</p>}</div>:view === 'history' ? <><p className="setting-hint">Search covers your complete saved history. Open an item to continue editing, see its versions or move it to a project.</p><div className="dashboard-grid">{filtered.map(e => <button className="saved-work" key={e.id} onClick={()=>void openWork(e)}><span className="step-tag">{e.brief.tool || 'tagline'} · {e.brief.project || 'Unfiled'}</span><h2>{e.title||e.brief.idea.slice(0,70)}</h2><p>{e.results[0]?.text}</p><small>{new Date(e.createdAt).toLocaleString()} · {e.kind||'generation'} · {e.results.length} result(s)</small></button>)}</div>{!filtered.length && !loading && <div className="empty"><h2>{entries.length ? 'Nothing matches those filters.' : 'Your ideas live here.'}</h2><p>Create a Quickie to start your first project.</p><a href="/">Open the writing tools →</a></div>}{hasMore && <button className="another" disabled={loading} onClick={() => void load(page + 1)}>Load older work</button>}</> : <div className="dashboard-grid">{favorites.filter(r => r.text.toLowerCase().includes(query.toLowerCase())).map(r => <article className="saved-work" key={r.id}><p className="content-output">{r.text}</p><button onClick={() => void copy(r.text)}>Copy</button><button onClick={()=>void shareCard(r)}>Download share card</button><button onClick={async () => { try {
        await api('favorites/' + r.id, 'DELETE');
        setFavorites(fs => fs.filter(f => f.id !== r.id));
    }
    catch (e) {
        toast.error((e as Error).message);
    } }}>Remove favorite</button></article>)}{!favorites.length && <p>No favorites yet. Save a result with its heart button.</p>}</div>}{loading && <p role="status">Loading your good ideas…</p>}</main><Dialog open={!!open} onOpenChange={v => { if (!v)setOpen(null); }}><DialogContent className="work-dialog"><DialogTitle>{open?.title||'Saved Quickie'}</DialogTitle>{open && <div className="history-scroll"><h3>Original input</h3><p className="content-output">{open.brief.idea}</p>{open.brief.context && <p>Context: {open.brief.context}</p>}<p className="setting-hint">{open.brief.tones.join(' · ')} · {open.brief.format || 'plain'}</p><div className="writing-settings"><label>Project<input value={move} onChange={e => setMove(e.target.value)} maxLength={80} list="projects"/><datalist id="projects">{projects.filter(p => p !== 'Unfiled').map(p => <option key={p} value={p}/>)}</datalist></label><button disabled={saving} onClick={() => void saveProject()}>Save project</button></div>{open.results.map(r => <article className="saved-output" key={r.id}><p className="content-output">{r.text}</p><button onClick={() => void copy(r.text)}>Copy output</button><button onClick={()=>void shareCard(r)}>Download share card</button></article>)}<div className="dashboard-toolbar"><button onClick={()=>{try{sessionStorage.setItem('qt-continue',JSON.stringify(open));window.location.assign('/')}catch{toast.error('Could not open this draft.')}}}>Continue editing</button><button onClick={() => { try {
        sessionStorage.setItem('qt-reuse', JSON.stringify(open.brief));
        window.location.assign('/');
    }
    catch {
        toast.error('Browser storage is unavailable.');
    } }}>Reuse input & settings</button><button onClick={() => setDeleting(open.id)}>Delete from history</button></div><h3>Version history</h3>{versions.map(v=><button key={v.id} className="history-entry" onClick={()=>{setOpen(v);setMove(v.brief.project||'')}}><span>{v.kind||'generation'} · {new Date(v.createdAt).toLocaleString()}</span></button>)}</div>}</DialogContent></Dialog><Dialog open={projectDialog} onOpenChange={setProjectDialog}><DialogContent><DialogTitle>{renameFrom?'Rename project':'Create a project'}</DialogTitle><label className="form-label">Project name<input value={projectName} maxLength={80} onChange={e=>setProjectName(e.target.value)}/></label><button className="primary-button" disabled={saving||!projectName.trim()} onClick={()=>void manageProject()}>Save project</button></DialogContent></Dialog><AlertDialog open={!!deleting} onOpenChange={v => { if (!v)
        setDeleting(null); }}><AlertDialogContent><AlertDialogTitle>Delete this generation?</AlertDialogTitle><AlertDialogDescription>This removes it from your cloud history. Saved favorites are kept.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Keep it</AlertDialogCancel><AlertDialogAction disabled={saving} onClick={e => { e.preventDefault(); void remove(); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>;
}
