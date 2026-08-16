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
COPY --from=builder /app/.output ./
EXPOSE 3000
CMD ["node", "./server/index.mjs"]
