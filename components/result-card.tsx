"use client";
import { Copy, Heart, ArrowUpRight, MoreHorizontal, Download, RotateCw, Sparkles, Flame } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { actions, type Result } from '@/lib/config';
export function ResultCard({ result, index, saved, busy, onCopy, onFavorite, onTransform, onShare, onDownload }: {
    result: Result;
    index: number;
    saved: boolean;
    busy: boolean;
    onCopy: () => void;
    onFavorite: () => void;
    onTransform: (action: typeof actions[number]) => void;
    onShare: () => void;
    onDownload: () => void;
}) {
    return <article className="result-card"><div className="result-top"><span className="result-number">{String(index + 1).padStart(2, '0')}</span><div><button className="icon-button" aria-label="Copy tagline" onClick={onCopy}><Copy size={17}/></button><button className={'icon-button ' + (saved ? 'saved' : '')} aria-label={saved ? 'Remove favorite' : 'Save favorite'} aria-pressed={saved} onClick={onFavorite}><Heart size={18} fill={saved ? 'currentColor' : 'none'}/></button><DropdownMenu><DropdownMenuTrigger asChild><button className="icon-button" aria-label="More tagline actions"><MoreHorizontal size={19}/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={onShare}><ArrowUpRight />Share tagline</DropdownMenuItem><DropdownMenuItem onClick={onDownload}><Download />{result.text.length > 300 ? 'Download text' : 'Download share card'}</DropdownMenuItem><DropdownMenuItem disabled={busy} onClick={() => onTransform('Regenerate')}><RotateCw />Regenerate</DropdownMenuItem>{actions.filter(a => !['Make it better', 'Make it worse', 'Regenerate'].includes(a)).map(a => <DropdownMenuItem disabled={busy} key={a} onClick={() => onTransform(a)}>{a === 'Make it professional' ? 'Okay, now make it actually usable.' : a}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div></div>{result.text.length > 300 ? <p className="content-output">{result.text}</p> : <h3>“{result.text}”</h3>}<div className="styles">{result.style.join(' · ')}</div><div className="result-bottom"><button disabled={busy} onClick={() => onTransform('Make it better')}><Sparkles size={14}/>Make it better</button><button disabled={busy} className="worse-action" onClick={() => onTransform('Make it worse')}><Flame size={14}/>Make it worse</button></div></article>;
}
