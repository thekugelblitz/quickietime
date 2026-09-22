# qtai.click release validation

Validated in the development workspace on 2026-09-22.

## Passed

- ESLint and TypeScript production compilation.
- 50 automated tests, including existing generation/history/project behavior, credit accounting, admin isolation, encrypted settings, coupons, payment amount/currency checks, idempotent fulfillment, refunds, mocked provider checkout flows, forged webhook rejection and replay handling.
- Native Next.js standalone production build.
- Production HTTP smoke test: all 32 public pages, unique-page canonicals, one H1, descriptions, valid JSON-LD, internal links, private-route protection, email code verification/replay checks, quotas, projects and logout.
- Production admin HTTP tests: setup, customer/admin isolation, masked settings, published packs appearing on Pricing, coupons, metrics and session revocation.
- SQLite online backup and integrity check.
- Compose YAML structure validation.
- Visual inspection of the corrected credits FAQ, mobile island and header, navigation menu, and administrator setup screen. Mobile menu activation was verified after configuring the development server’s allowed origin.

## Not verified here

- Docker image build: no Docker daemon in this workspace.
- Deployment to the user's Dokploy server: server access was not supplied.
- Real SMTP email delivery or real merchant sandbox/production payments. Gateway tests use mocked API responses; follow DOKPLOY.md before enabling live sales.
- A measured production performance improvement or real-user Core Web Vitals. Improvements include deferred result UI, on-demand account history, static public content, native scroll-snap examples and deferred offscreen rendering; measure the deployed domain with real traffic.
- Search-engine indexing, rankings or AI citations. These remain external outcomes, not guarantees.

No private customer accounts, saved generations, API credentials or runtime database are included in the source archive. The existing hosted AI secret cannot be read back from Sites; enter it once in the new admin settings.
