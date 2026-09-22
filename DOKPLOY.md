# QuickieTime on qtai.click

This is the full self-hosted application. It uses Next.js standalone output, Node.js 24 and a persistent SQLite database. The previous Sites-hosted application and its accounts are separate; this package does not migrate their private data automatically.

## First deployment

1. Put this source in a private Git repository. In Dokploy create a **Docker Compose** service pointing to the repository and `docker-compose.yml` at its root.
2. In Dokploy's **Environment** editor, set the values below. Generate three separate random values with `openssl rand -hex 32`. No API credentials belong in source files.

```dotenv
SITE_URL=https://qtai.click
SITE_OPERATOR=HostingSpell LLP
CONTACT_EMAIL=support@qtai.click
SITE_INDEXABLE=true
AUTH_SECRET=YOUR_FIRST_RANDOM_VALUE
SETTINGS_ENCRYPTION_KEY=YOUR_SECOND_RANDOM_64_HEX_VALUE
ADMIN_SETUP_TOKEN=YOUR_THIRD_RANDOM_VALUE
```

The operator and contact mailbox are defaults based on this project. Confirm the mailbox exists and receives support messages; change CONTACT_EMAIL if needed. Public identity settings are build-time values, so rebuild when changing them. Runtime values must match.

3. In Dokploy's Domains tab add **qtai.click**, select service **quickietime**, container port **3000**, and enable HTTPS (Certificate: Let's Encrypt).
4. Deploy. The container health endpoint is `/api/health`. SQL migrations run automatically.

### Resolving the "404 page not found" error on qtai.click

If browsing `https://qtai.click` returns a 404 error, check these items:

1. **Traefik Network Attachment**:
   Dokploy's Traefik reverse proxy routes traffic through the external Docker network `dokploy-network`.
   In `docker-compose.yml`, `quickietime` is attached to `dokploy-network`. If `dokploy-network` does not exist on your server, create it once via terminal:
   ```bash
   docker network create dokploy-network
   ```
2. **Domain Configuration in Dokploy**:
   - Go to your Compose project in Dokploy -> **Domains** tab.
   - Domain: `qtai.click`
   - Service: `quickietime`
   - Container Port: `3000` (NOT 80 or 8080)
   - Path: `/`
   - HTTPS: Enabled (Let's Encrypt)
3. **Environment Validation**:
   Next.js validates required variables upon container launch (`scripts/validate-env.mjs`). If `AUTH_SECRET` (min 32 chars) or `SETTINGS_ENCRYPTION_KEY` (exact 64 hex chars) are missing or malformed, the container stops before listening, causing Traefik to serve a 404.
   Inspect container logs in Dokploy:
   ```bash
   docker logs $(docker ps -q -f name=quickietime)
   ```
4. **Alternative Dokploy Deployment (Single Application)**:
   If you prefer deploying QuickieTime as an Application rather than Docker Compose in Dokploy:
   - Create an Application in Dokploy from your Git repository.
   - Build Type: **Dockerfile** (pointing to `Dockerfile` at root).
   - Port: `3000`.
   - Set the same environment variables in the Application Environment tab.
   - In the Domains tab, map `qtai.click` to Port 3000.

5. Open **https://qtai.click/bhai**. Enter the setup token and choose your admin email and a password of at least 12 characters. This one-time setup is permanently disabled once an admin exists. Remove ADMIN_SETUP_TOKEN from Dokploy and redeploy.
6. In **Connections & costs**, configure AI, SMTP, payment gateways and your actual cost assumptions. These are encrypted in the database; updates apply to new requests immediately. Existing environment credentials remain optional fallbacks, but newly saved dashboard values take precedence. A secret field left blank keeps the saved value. Secrets are never sent back to the browser.
7. Set up and test email delivery. Customer sign-in uses verified email codes; administrator sign-in is separate and does not require SMTP.
8. Configure at least one gateway and its webhook; create a pack and publish it. Draft packs remain hidden. No paid plan is published by default.

**Keep SETTINGS_ENCRYPTION_KEY and AUTH_SECRET stable across redeploys.** Back up the encryption key separately from the database. Losing it makes saved provider credentials unreadable. Do not copy a database without its key.

## Admin controls

- Overview: accounts, generation success/failure, token usage, latency, revenue by currency, configured AI costs, estimated fees/overhead, estimated profit and ROI.
- Users: search, view balances, grant/deduct credits with an audit reason, suspend access and revoke sessions.
- Generations: search saved input/output, inspect history. Administrative views are audited.
- Credit packs: create/edit/publish one-time packages in INR or USD. Purchased credits do not expire; daily free credits are used first. This release intentionally does not charge recurring subscriptions.
- Coupons: percentage discounts (1–90%), expiration, maximum claims, enable/disable. One claim per account. Pending orders reserve claims; reviewing pending orders avoids accidentally overselling a limited coupon.
- Orders: inspect, reconcile provider status, and record refunds already issued through the provider. The refund action **does not transfer money**. Record the cumulative refunded amount and provider reference. Credits are revoked proportionately; a used balance may become negative.
- Settings: encrypted AI, SMTP and payment credentials plus configurable cost assumptions.
- Security: change admin password (revokes all admin sessions), audited administrative changes, bounded login attempts, 12-hour HttpOnly admin session, CSRF origin checks. Customer sessions cannot authenticate admin routes. Use a strong unique password; the application does not currently provide MFA.

## Payment providers

Use sandbox/test credentials first. The server creates the final amount, currency and coupon discount; clients cannot supply prices or credit amounts. Credit grants are transactional and idempotent. A success redirect alone does not grant credits.

| Provider | Admin settings | Webhook URL | Events |
| --- | --- | --- | --- |
| Stripe | Secret API key + signing secret | `https://qtai.click/api/webhooks/stripe` | `checkout.session.completed`, `checkout.session.async_payment_succeeded` |
| PayPal | Client ID + client secret + webhook ID + sandbox/live mode | `https://qtai.click/api/webhooks/paypal` | `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED` |
| Razorpay | Key ID + key secret + webhook secret | `https://qtai.click/api/webhooks/razorpay` | `payment_link.paid` |

Stripe uses hosted Checkout; Razorpay uses hosted Payment Links; PayPal uses Orders v2. PayPal is not offered for INR packs. Availability depends on your merchant account, region and supported currencies. Use USD packs for PayPal; do not infer that merchant accounts have been approved. No card or bank credentials are stored by this application.

Webhook payload signatures are verified and the server fetches the provider record before fulfilling an order. PayPal approval is captured server-side with an idempotency key. Customers can use Verify / complete payment on their order page; admins can reconcile pending orders. Refunds and disputes must be reviewed in the provider dashboard and recorded locally; they are not automatically synchronized in this release. Keep prior credentials valid until pending orders settle. Review pending orders before changing PayPal sandbox/live mode or merchant accounts.

For an ambiguous Razorpay create-link timeout, check the reference ID in the provider dashboard. Do not create a second manual paid order. Contact the operator to reconcile the original link. Existing database order references are preserved.

## Launch acceptance checks

- Sign in as an admin, save settings, create a draft pack, publish it, and see it on Pricing.
- Configure a real SMTP sender and verify a customer email code.
- Test a successful, cancelled and failed payment in each enabled provider's sandbox; verify the exact amount/currency and credits.
- Deliver the same webhook twice; verify no double grant.
- Apply an expired or used coupon; verify rejection.
- Spend daily credits before purchased credits; failed AI requests return their reserved credit.
- Verify order ownership with two customer accounts and deny admin APIs to both.
- Issue a test refund at the provider, record it locally, and confirm credit adjustment.
- Redeploy; verify accounts, saved work, settings, orders and balances survive.
- Check both mobile and desktop, including the FAQ, glass navigation and examples carousel.
- Verify `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/llms-full.txt` use qtai.click; `/bhai`, `/checkout`, `/billing`, `/account`, `/dashboard` and APIs are excluded from indexing.

## Persistence and backup

Run **one replica on one node**. Named volume `quickietime_data` contains SQLite and WAL files; `quickietime_backups` contains snapshots. Do not delete them during deploys. No NFS sharing or multi-node SQLite replication. Migrate to a shared database before horizontal scaling.

Daily from the container terminal or scheduler:

```sh
node scripts/backup.mjs
node scripts/maintenance.mjs
```

Online backup checks database integrity and retains local snapshots for 30 days by default. Ship the backup volume off-server using Dokploy Volume Backups or your backup service. Store the encryption key separately and test restoration. Maintenance removes expired customer/admin sessions, codes, rate records and daily counters; it preserves financial records and audit history.

Restore while the app is stopped. Preserve the old directory, restore the snapshot as `/app/data/quickietime.sqlite`, move stale WAL/SHM files aside, ensure UID/GID 1001 owns the volume contents, and restart with the matching encryption key. Reapply account deletion requests newer than the snapshot. Take a snapshot before schema upgrades.

`TRUST_PROXY=true` trusts Traefik's X-Real-IP. Do not expose container port 3000 directly or trust arbitrary forwarded headers from the internet. Guests on the same public network share the guest allowance.

## Search and AI discovery

The release contains 32 public content pages, six task-specific tool pages, six detailed writing guides, four use cases, ten carousel examples and product/policy pages. Public pages use semantic HTML, unique descriptions, canonicals, internal links and appropriate structured data. Private data is never added to sitemap or llms files. The llms documents are supplemental discovery aids, not a guarantee that a crawler will use them.

Verify qtai.click in Google Search Console and Bing Webmaster Tools and submit `https://qtai.click/sitemap.xml`. Check robots/CDN rules and inspect representative URLs. Link useful guides from real relevant channels. Track actual search queries and improve pages that users find useful. Traffic, rankings and AI citations are not guaranteed.

## Validation boundary

Automated tests and a native Next.js production build can run in this workspace. The workspace has no Docker daemon, Dokploy credentials or merchant sandbox credentials. Actual container deployment, SMTP delivery and real provider checkout/webhook tests must run on your server before accepting live payments. Previously supplied Sites secrets are not exported into this source archive; configure the existing key once in the encrypted admin settings.

Official references: https://docs.dokploy.com/docs/core/docker-compose • https://docs.stripe.com/checkout/fulfillment • https://developer.paypal.com/api/rest/webhooks/rest/ • https://razorpay.com/docs/payments/payment-links/subscribe-to-webhooks/
