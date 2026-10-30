# syntax=docker/dockerfile:1.7

ARG VERSION=dev
ARG BUILD_DATE
ARG VCS_REF

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV COREPACK_HOME=/opt/corepack
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && \
    corepack prepare pnpm@9.15.4 --activate && \
    chmod -R a+rX "$COREPACK_HOME"
WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/validators/package.json ./packages/validators/
COPY packages/db/package.json ./packages/db/
COPY packages/mo/package.json ./packages/mo/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

FROM deps AS frontend-builder

COPY tsconfig.json ./
COPY packages/validators ./packages/validators
COPY packages/mo ./packages/mo
COPY apps/web ./apps/web

ARG VERSION
ARG VITE_KOE_API_URL=""
ARG VITE_KOE_PROJECT_KEY=""
ENV VITE_APP_VERSION=${VERSION}
ENV VITE_API_URL=""
ENV VITE_KOE_API_URL=${VITE_KOE_API_URL}
ENV VITE_KOE_PROJECT_KEY=${VITE_KOE_PROJECT_KEY}
ARG VITE_ANDROID_APP_URL=""
ENV VITE_ANDROID_APP_URL=${VITE_ANDROID_APP_URL}
RUN pnpm --filter @focusflow/web run build

FROM base AS runner

ARG VERSION
ARG BUILD_DATE
ARG VCS_REF

LABEL org.opencontainers.image.title="Tokō" \
    org.opencontainers.image.description="L'application qui aide les parents à guider leur enfant TDAH" \
    org.opencontainers.image.version="${VERSION}" \
    org.opencontainers.image.created="${BUILD_DATE}" \
    org.opencontainers.image.revision="${VCS_REF}" \
    org.opencontainers.image.source="https://github.com/wifsimster/toko" \
    org.opencontainers.image.vendor="wifsimster" \
    maintainer="wifsimster"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 toko

COPY --from=deps --chown=toko:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=toko:nodejs /app/packages/validators/node_modules ./packages/validators/node_modules
COPY --from=deps --chown=toko:nodejs /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps --chown=toko:nodejs /app/apps/api/node_modules ./apps/api/node_modules

COPY --chown=toko:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY --chown=toko:nodejs packages/validators/package.json ./packages/validators/
COPY --chown=toko:nodejs packages/db/package.json ./packages/db/
COPY --chown=toko:nodejs packages/mo/package.json ./packages/mo/
COPY --chown=toko:nodejs apps/api/package.json ./apps/api/

COPY --chown=toko:nodejs tsconfig.json ./
COPY --chown=toko:nodejs packages/validators/src ./packages/validators/src
COPY --chown=toko:nodejs packages/db/src ./packages/db/src
COPY --chown=toko:nodejs packages/mo/src ./packages/mo/src
COPY --chown=toko:nodejs packages/db/drizzle ./packages/db/drizzle
COPY --chown=toko:nodejs packages/db/drizzle.config.ts ./packages/db/drizzle.config.ts
COPY --chown=toko:nodejs apps/api/src ./apps/api/src
COPY --chown=toko:nodejs apps/api/tsconfig.json ./apps/api/tsconfig.json

COPY --from=frontend-builder --chown=toko:nodejs /app/apps/web/dist ./apps/web/dist

COPY --chown=toko:nodejs --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh

USER toko

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

CMD ["/docker-entrypoint.sh"]
