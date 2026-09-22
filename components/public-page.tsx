import Link from 'next/link';
import {PublicHeader} from './public-shell';
import {breadcrumb} from '@/lib/page-seo';
import {jsonLd} from '@/lib/site';
export function PublicPage({title,intro,path,eyebrow='SMALL EFFORT. BETTER WORDS.',children}:{title:string;intro:string;path:string;eyebrow?:string;children:React.ReactNode}){return <><PublicHeader/><main id="page-content" className="public-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumb(title,path))}}/><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">QuickieTime</Link><span>/</span><span aria-current="page">{title}</span></nav><header className="public-intro"><span className="step-tag">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></header>{children}</main></>}
export function StudioCTA({tool='tagline',title='Put the idea to work.'}:{tool?:string;title?:string}){return <aside className="studio-cta"><div><h2>{title}</h2><p>Start with 5 guest credits. Edit, copy and download for free.</p></div><Link className="primary-button" href={'/?tool='+tool}>Open the writing studio →</Link></aside>}
