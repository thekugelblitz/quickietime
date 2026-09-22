import Link from 'next/link';
import {notFound} from 'next/navigation';
import {useCases} from '@/lib/content';
import {toolCatalog} from '@/lib/config';
import {PublicPage,StudioCTA} from '@/components/public-page';
import {pageMetadata} from '@/lib/page-seo';
export const dynamicParams=false;
export function generateStaticParams(){return useCases.map(u=>({slug:u.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const u=useCases.find(u=>u.slug===slug);return u?pageMetadata(u.title,u.description,'/use-cases/'+slug):{title:'Not found'}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const u=useCases.find(u=>u.slug===slug);if(!u)notFound();return <PublicPage title={u.title} intro={u.intro} path={'/use-cases/'+slug} eyebrow="A WORKFLOW THAT FITS"><div className="workflow-steps">{u.steps.map(([heading,body],i)=><section key={heading}><span>0{i+1}</span><div><h2>{heading}</h2><p>{body}</p></div></section>)}</div><section className="editorial-example"><span>AN EXAMPLE BRIEF</span><p>{u.example}</p></section><section className="prose-section"><h2>Tools for this workflow</h2><div className="related-tools">{u.tools.map(t=><Link className="tool-use" href={'/tools/'+t} key={t}>{toolCatalog.find(x=>x.id===t)?.name} →</Link>)}</div><p>Review every draft before using it. AI can make errors, and public examples do not guarantee identical results.</p></section><StudioCTA tool={u.tools[0]}/><Link className="text-link" href="/use-cases">Explore other workflows →</Link></PublicPage>}
