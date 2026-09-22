"use client";
import {ArrowUpRight,Sparkles} from 'lucide-react';
import {sampleLines,starters} from '@/lib/studio';
import type {Tool} from '@/lib/config';
export function StudioSample({tool,onTry}:{tool:Tool;onTry:()=>void}){const s=sampleLines[tool];return <div className="sample-studio"><div className="sample-heading"><span className="sample-sticker"><Sparkles size={15}/> A LITTLE WORD MAGIC</span><span className="sample-label">Illustrative example</span></div><div className="sample-before"><span>THE RAW MATERIAL</span><p>{s.before}</p></div><div className="sample-after"><span>THE QUICKIE</span><p>{s.after}</p><Sparkles className="sample-spark" size={32}/></div><div className="sample-footer"><p>{s.note}</p><button onClick={onTry}>Try “{starters[tool][0].label}” <ArrowUpRight size={16}/></button><small>Loads an example brief. No credit used until you generate.</small></div></div>}
