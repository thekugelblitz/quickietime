import {siteUrl} from '@/lib/site';
import {toolCatalog} from '@/lib/config';
import {articles,useCases} from '@/lib/content';
export const dynamic='force-static';
export function GET(){const text=`# QuickieTime

> Six AI writing tools with task-specific controls, free daily allowances and private saved work.

## Tools
${toolCatalog.map(t=>`- [${t.name}](${siteUrl}/tools/${t.id}): ${t.description}`).join('\n')}

## Writing guides
${articles.map(a=>`- [${a.title}](${siteUrl}/guides/${a.slug}): ${a.description}`).join('\n')}

## Workflows
${useCases.map(u=>`- [${u.title}](${siteUrl}/use-cases/${u.slug})`).join('\n')}

## Product and trust
- [Plans and limits](${siteUrl}/pricing)
- [FAQs](${siteUrl}/faq)
- [Examples](${siteUrl}/examples)
- [How it works](${siteUrl}/how-it-works)
- [About](${siteUrl}/about)
- [Privacy](${siteUrl}/privacy)
- [Terms](${siteUrl}/terms)
- [Refunds](${siteUrl}/refund-policy)
- [Responsible AI](${siteUrl}/responsible-ai)
- [Editorial policy](${siteUrl}/editorial-policy)
- [Contact](${siteUrl}/contact)
- [Full guide text](${siteUrl}/llms-full.txt)

## Accurate product facts
Guests receive 5 credits per day; verified-email accounts receive 20. Reset: midnight UTC.
A generation or requested AI transformation costs one credit; failures are refunded. Manual editing, copying, downloads and version saves are free.
Taglines: 5, 10 or 16 words per idea. Headlines: 110 characters each. Email subjects: 70 characters each. X captions: 280 characters each.
Long drafts/caption batches: 300 guest or 700 signed-in words total. Summaries are shorter than their source.
The summarizer uses pasted text only and does not fetch URLs. The site does not publish or send generated content for users.
Public examples are editorial illustrations, not testimonials or guaranteed output.
Optional one-time credit packs are configured by the operator. Purchased credits have no expiry and are used after daily free credits. Current prices are on the pricing page. No recurring subscriptions.
No user generations, account details or dashboard pages belong in public indexing. These require authentication.
`;
return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}})}
