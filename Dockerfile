# Build arguments
ARG VERSION=dev
ARG BUILD_DATE
ARG VCS_REF

# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/validators/package.json ./packages/validators/
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build frontend (only stage that needs a build step)
FROM deps AS frontend-builder
WORKDIR /app

COPY tsconfig.json ./
COPY packages/validators ./packages/validators
COPY apps/web ./apps/web

ARG VERSION
ENV VITE_APP_VERSION=${VERSION}
ENV VITE_API_URL=""
RUN pnpm --filter @focusflow/web run build

# Stage 3: Production runtime
FROM node:22-alpine AS runner

# Build arguments for labels
ARG VERSION
ARG BUILD_DATE
ARG VCS_REF

# Image metadata
LABEL org.opencontainers.image.title="Tokō" \
    org.opencontainers.image.description="L'application qui aide les parents à guider leur enfant TDAH" \
    org.opencontainers.image.version="${VERSION}" \
    org.opencontainers.image.created="${BUILD_DATE}" \
    org.opencontainers.image.revision="${VCS_REF}" \
    org.opencontainers.image.source="https://github.com/wifsimster/toko" \
    org.opencontainers.image.vendor="wifsimster" \
    maintainer="wifsimster"

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 toko

# Copy package files for install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/validators/package.json ./packages/validators/
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/

# Install all dependencies (tsx needed at runtime for internal packages pattern)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code (internal packages pattern — tsx transpiles at runtime)
COPY tsconfig.json ./
COPY packages/validators/src ./packages/validators/src
COPY packages/db/src ./packages/db/src
COPY packages/db/drizzle ./packages/db/drizzle
COPY packages/db/drizzle.config.ts ./packages/db/drizzle.config.ts
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json

# Copy built frontend
COPY --from=frontend-builder /app/apps/web/dist ./apps/web/dist

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set ownership
RUN chown -R toko:nodejs /app

# Switch to non-root user
USER toko

# Expose port
EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start
CMD ["/docker-entrypoint.sh"]
