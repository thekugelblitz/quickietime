FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG SITE_URL=https://qtai.click
ARG SITE_OPERATOR="HostingSpell LLP"
ARG CONTACT_EMAIL=support@qtai.click
ARG AI_PROVIDER=cheaperinference
ARG SITE_INDEXABLE=true
ENV SITE_URL=$SITE_URL SITE_OPERATOR=$SITE_OPERATOR CONTACT_EMAIL=$CONTACT_EMAIL AI_PROVIDER=$AI_PROVIDER SITE_INDEXABLE=$SITE_INDEXABLE
RUN node scripts/validate-public-config.mjs && pnpm build
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 DATABASE_PATH=/app/data/quickietime.sqlite
RUN groupadd --system --gid 1001 app && useradd --system --uid 1001 --gid app app && mkdir -p /app/data /app/backups && chown -R app:app /app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/drizzle ./drizzle
COPY --from=builder --chown=app:app /app/scripts/validate-env.mjs /app/scripts/validate-public-config.mjs /app/scripts/backup.mjs /app/scripts/maintenance.mjs ./scripts/
EXPOSE 3000
CMD ["sh","-c","mkdir -p /app/data /app/backups && chmod 777 /app/data /app/backups 2>/dev/null || true; node scripts/validate-env.mjs && node server.js"]
