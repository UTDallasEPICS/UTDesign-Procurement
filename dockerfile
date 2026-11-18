# Build container
FROM node:lts-alpine AS builder

# Use Workdir because things like tailwind will scan the entire current dir and can cause issues if it scans root
WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

ENV PNPM_HOME="~/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g pnpm

RUN pnpm i --frozen-lockfile

COPY . ./
RUN pnpm prisma generate
RUN pnpm run build


# Deployment container
FROM node:lts-alpine AS deployment
WORKDIR /app
# Copy stuff from build container to ensure we have prisma and everything it needs
COPY --from=builder /app/.output ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
RUN npm i -g pnpm

# Install Prisma without running any scripts to avoid running nuxt scripts
RUN pnpm i --dev --ignore-scripts --frozen-lockfile
# Run the build scripts needed for prisma to work (for migrations and seeding)
RUN pnpm rebuild esbuild better-sqlite3 @prisma/engines prisma
RUN pnpm prisma generate
COPY --from=builder /app/entrypoint.sh /entrypoint

# Ensure we can actually run the entrypoint script
RUN chmod +x /entrypoint
EXPOSE 3000
ENTRYPOINT ["/entrypoint"]
CMD ["node", "./server/index.mjs"]
