FROM node:20-alpine AS dev

WORKDIR /app
EXPOSE 3000

RUN npm i -g pnpm

COPY package.json pnpm-*.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "run", "dev"]

FROM node:20-alpine as prod

RUN adduser -S appuser

WORKDIR /app
EXPOSE 3000

COPY --from=dev /app/package.json ./package.json
COPY --from=dev /app/node_modules ./node_modules
COPY --from=dev /app/.output ./.output

RUN chown -R appuser /app

USER appuser


CMD ["node", ".output/server/index.mjs"]