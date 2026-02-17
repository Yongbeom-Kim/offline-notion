FROM node:20-alpine AS dev

WORKDIR /app
EXPOSE 3000

RUN npm i -g pnpm

COPY package.json pnpm-*.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "run", "dev"]

FROM dev AS build

RUN pnpm run build

FROM node:20-alpine AS prod

RUN adduser -S appuser

WORKDIR /app
EXPOSE 3000

COPY --from=build --chown=appuser:appuser /app/package.json ./package.json
COPY --from=build --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appuser /app/.output ./.output

USER appuser


CMD ["node", ".output/server/index.mjs"]
