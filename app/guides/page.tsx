import Link from 'next/link';
import {articles} from '@/lib/content';
import {PublicPage} from '@/components/public-page';
import {pageMetadata} from '@/lib/page-seo';
export const metadata=pageMetadata('Practical AI writing guides','Learn how to write taglines, rewrite accurately, summarize notes, draft customer replies and format text for Markdown or WhatsApp.','/guides');
export default function Page(){return <PublicPage title="Better briefs. Better first drafts." intro="Practical writing advice, concrete examples and the checks that matter before you press publish." path="/guides" eyebrow="THE QUICKIETIME FIELD NOTES"><div className="public-card-grid">{articles.map(a=><article className="public-card" key={a.slug}><span className="category-pill">{a.category}</span><h2><Link href={'/guides/'+a.slug}>{a.title}</Link></h2><p>{a.description}</p><Link className="text-link" href={'/guides/'+a.slug}>Read the guide →</Link></article>)}</div></PublicPage>}
