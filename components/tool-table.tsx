"use client";
import Link from 'next/link';
import { toolCatalog, type Brief } from '@/lib/config';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
export function ToolTable({ selected, onSelect }: {
    selected: Brief['tool'];
    onSelect: (id: Brief['tool']) => void;
}) { return <section className="tool-directory" aria-label="Writing tools"><div className="directory-heading"><h2>Pick your Quickie.</h2><p>Every tool. One credit. No big production.</p></div><Table><TableHeader><TableRow><TableHead>Tool</TableHead><TableHead>What it does</TableHead><TableHead>Get started</TableHead></TableRow></TableHeader><TableBody>{toolCatalog.map(t => <TableRow key={t.id} data-selected={selected === t.id}><TableCell><button aria-pressed={selected === t.id} onClick={() => onSelect(t.id)}>{t.name}</button></TableCell><TableCell>{t.description} <Link className="tool-guide" href={'/tools/' + t.id}>Tips & examples</Link></TableCell><TableCell><button className="tool-use" onClick={() => onSelect(t.id)}>{selected === t.id ? 'Selected' : 'Use tool'}</button></TableCell></TableRow>)}</TableBody></Table></section>; }
