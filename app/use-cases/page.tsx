import Link from 'next/link';
import {useCases} from '@/lib/content';
import {PublicPage,StudioCTA} from '@/components/public-page';
import {pageMetadata} from '@/lib/page-seo';
export const metadata=pageMetadata('AI writing use cases','Practical AI writing workflows for small businesses, customer support, content creators and everyday communication.','/use-cases');
export default function Page(){return <PublicPage title="Real work. Fewer blank pages." intro="Start with the job you need to finish, then choose the tool and the right amount of creative freedom." path="/use-cases"><div className="public-card-grid">{useCases.map(u=><article key={u.slug} className="public-card"><h2><Link href={'/use-cases/'+u.slug}>{u.title}</Link></h2><p>{u.description}</p><Link className="text-link" href={'/use-cases/'+u.slug}>See the workflow →</Link></article>)}</div><StudioCTA/></PublicPage>}
