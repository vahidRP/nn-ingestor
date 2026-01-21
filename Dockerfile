FROM node:22-slim AS base
ARG PORT=9001
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=$PORT
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
ENV HUSKY=0
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY certs ./certs
RUN pnpm build

FROM base AS runner
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
ENV HUSKY=0
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=build /app/dist ./dist
COPY --from=build /app/certs ./certs
EXPOSE $PORT
CMD ["node", "dist/index.js"]
