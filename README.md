# QuickieTime — qtai.click

A self-hosted AI writing studio and business control station, ready for Docker Compose on Dokploy.

**Start with [DOKPLOY.md](DOKPLOY.md).** Production domain: `https://qtai.click`. Admin URL: `/bhai`.

- Six task-specific writing tools with 5 guest / 20 verified-account daily credits, private projects, history, favorites, editable versions and uniquely named PNG share cards.
- Glass-style mobile navigation, ten swipeable examples and corrected accessible FAQ layouts. Result editor code loads on demand; history loads when requested.
- 32 public pages with tool guides, editorial articles, use cases, pricing, examples, FAQs, contact and policies. Canonicals, sitemap, structured data, robots rules and AI-readable public text use qtai.click.
- Separate protected administrator account: users, generations, orders, credit packs, coupons, audit trail, encrypted service credentials and configurable cost/ROI estimates.
- Hosted Stripe, PayPal and Razorpay checkout adapters with authenticated order creation, provider verification and transactional, idempotent credits. One-time packs; no recurring billing. Refunds are issued at the provider and recorded in the admin station.
- Persistent SQLite, health check, automatic migrations, online backups and a non-root standalone Docker runtime.

## Local development

Node.js 24 and pnpm 11.25.0 are required.

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
# For local use: SITE_URL=http://localhost:3000 and TRUST_PROXY=false.
# Set AUTH_SECRET, SETTINGS_ENCRYPTION_KEY and ADMIN_SETUP_TOKEN once.
pnpm dev
```

Configure AI, SMTP and payment credentials at `/bhai`, not in source files. They are encrypted with SETTINGS_ENCRYPTION_KEY and never returned to the UI. Blank secret inputs preserve saved credentials. Back up the key separately.

```sh
pnpm lint
pnpm typecheck
pnpm test
SITE_URL=https://qtai.click SITE_OPERATOR='HostingSpell LLP' CONTACT_EMAIL=support@qtai.click pnpm build
SMOKE_SITE_URL=https://qtai.click pnpm test:smoke
```

The smoke test uses an isolated temporary database and does not send real email or make real AI/payment requests. Automated provider tests use recorded-shape mock responses; merchant sandbox tests still must run before launch.

## Operating limits

Run one replica on one node with persistent local volumes. Migrate to a shared database before horizontal scaling. Do not expose port 3000 directly; trust only your configured proxy for client network addresses.

Existing Sites accounts and secrets are not included in this export. No private account migration is automatic. Real SMTP delivery, production payments and the Docker image must be tested on your Dokploy server. Search ranking, traffic and AI citations cannot be guaranteed. See the launch checklist and privacy/payment notes in DOKPLOY.md.
