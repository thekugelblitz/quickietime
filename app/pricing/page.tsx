import {PublicPage} from '@/components/public-page';
import {CreditPacks} from '@/components/billing';
import {publicPages} from '@/lib/public-pages';
import {plans,providers} from '@/lib/server/billing';
import {pageMetadata} from '@/lib/page-seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('AI writing plans & credit packs','Start with 5 guest or 20 account credits per day. Buy optional one-time credit packs with no expiry and no recurring subscription.','/pricing');
export default function Page(){return <PublicPage title="Start free. Make room for more." intro="A daily helping of ideas, with extra credits when you need them." path="/pricing"><div className="public-prose wide-prose">{publicPages.pricing.content()}<CreditPacks packs={plans().map(p=>({...p,providers:providers(p.currency)}))}/></div></PublicPage>}
