FROM node:24-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js evaluates the Payload config during the image build. These values are
# build-only and are not copied into the runtime environment.
ENV DATABASE_URL=file:./data/build.db
ENV PAYLOAD_SECRET=build-only-secret-not-for-runtime

RUN mkdir -p data media && npm run build

FROM base AS content-sync

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .

RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p data media \
  && chown -R node:node /app/data /app/media

USER node

CMD ["npm", "run", "content:sync:if-changed"]

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN mkdir -p .next data media && chown -R node:node /app

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
