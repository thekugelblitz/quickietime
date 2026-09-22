import {notFound} from 'next/navigation';
import {publicPages} from '@/lib/public-pages';
import {PublicPage,StudioCTA} from '@/components/public-page';
import {pageMetadata} from '@/lib/page-seo';
import {faqItems} from '@/lib/content';
import {jsonLd} from '@/lib/site';
export const dynamicParams=false;
export function generateStaticParams(){return Object.keys(publicPages).filter(page=>page!=='pricing').map(page=>({page}))}
export async function generateMetadata({params}:{params:Promise<{page:string}>}){const {page}=await params;const p=publicPages[page];const titles:Record<string,string>={faq:'Frequently asked questions',pricing:'Free AI writing plans & credits',examples:'AI writing examples','how-it-works':'How QuickieTime works',about:'About QuickieTime',contact:'Contact QuickieTime support'};return p?pageMetadata(titles[page]||p.title,p.description,'/'+page):{title:'Not found'}}
export default async function Page({params}:{params:Promise<{page:string}>}){const {page}=await params;const p=publicPages[page];if(!p)notFound();return <PublicPage title={p.title} intro={p.description} path={'/'+page}>{page==='faq'&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqItems.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))})}}/>}<div className={'public-prose '+(['pricing','examples','faq','how-it-works'].includes(page)?'wide-prose':'')}>{p.content()}</div>{['how-it-works','about','examples','faq'].includes(page)&&<StudioCTA/>}</PublicPage>}
