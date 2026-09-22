# Search and AI discovery launch checklist

## Shipped foundation

- 32 crawlable public HTML routes, with real tool guidance rather than placeholder keyword pages.
- Six tool pages, six detailed writing articles, four distinct workflows and product/trust pages.
- Unique page titles and descriptions, canonical URLs, clear headings, linked navigation and footer.
- WebSite, Organization, WebApplication, WebPage, BreadcrumbList, Article and matching FAQPage structured data where relevant. FAQ markup does not guarantee a search feature.
- Domain-aware sitemap.xml, robots.txt, llms.txt and llms-full.txt. The text files are supplementary documentation, not a special ranking requirement.
- Private dashboard/account/auth routes excluded from public discovery and marked noindex. Authentication enforces private access; robots rules are not security controls.
- No fabricated reviews, customers, ratings, visitor counts or results.

## Before launching on the final domain

1. Set the real HTTPS SITE_URL, SITE_OPERATOR, CONTACT_EMAIL and selected AI provider before building. Review privacy/terms against your actual business and hosting configuration.
2. Verify the final hostname in Google Search Console and Bing Webmaster Tools. Submit its sitemap. Inspect one tool page, one article and one use-case page.
3. Check robots/CDN settings allow legitimate search crawlers, including OAI-SearchBot for ChatGPT search eligibility. Allowing a crawler does not prove indexing.
4. Use SITE_INDEXABLE=false for staging and rebuild before public launch. Redirect old URLs permanently when you control the old hostname; avoid leaving two equal production copies indefinitely.
5. Test mobile signup, generation, copy/export, account recovery and persistence after redeployment.

## Grow with evidence

The existing analytics module emits browser events only; it does not send events to a reporting provider. Connect a privacy-appropriate analytics service if you want measured activation/retention reporting. Never send prompts or generated text as event properties. Update privacy information and consent controls if your analytics requires them.

Promote useful demonstrations to your existing audience and relevant communities. For HostingSpell users, a focused customer-reply or product-description example is more useful than generic “AI does everything” copy. Avoid unsolicited bulk posting.

Review real search queries, impressions and clicks weekly. Improve the pages that receive relevant impressions but fail to answer the visitor’s question. Add new guides when there is a distinct user need, not simply another keyword variation.

No implementation can guarantee indexing, citations, rankings, virality or massive visitor numbers. Search Console verification, analytics setup and promotion require accounts/access outside this source package and have not been performed here.

Primary references:
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots


Production origin: https://qtai.click. Keep /bhai, /billing and /checkout out of public indexing. Review payment policies and contact information before launch. Publish real, useful examples and use Search Console data to improve existing guides; avoid bulk duplicate pages.
