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

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output

RUN chown -R appuser /app

USER appuser


CMD ["node", ".output/server/index.mjs"]