FROM golang:1.24.11-alpine3.23 AS dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

CMD ["go", "tool", "air"]

FROM golang:1.24.11-alpine3.23 AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /out/server \
    .

FROM alpine:3.23 AS prod

COPY --from=build /out/server /server

EXPOSE 3001

RUN addgroup -g 65532 -S appuser && \
    adduser -u 65532 -S appuser -G appuser
USER appuser:appuser

HEALTHCHECK CMD wget -qO- http://localhost:3001/health >/dev/null || exit 1


CMD ["/server"]