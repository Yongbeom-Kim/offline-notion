package redis

// Locking mechanism only for a SINGLE redis instance.

import (
	"context"
	"log/slog"

	"github.com/redis/go-redis/v9"
)

type ms = int64

func getLockKey(lockName string) string {
	return "lock:" + lockName
}

var acquireScript = redis.NewScript(`
	local val = redis.call("GET", KEYS[1])
	if not val or val == ARGV[1] then
		redis.call("SET", KEYS[1], ARGV[1], "PX", ARGV[2])
		return 1
	else
		return 0
	end
`)

var releaseScript = redis.NewScript(`
	local val = redis.call("GET", KEYS[1])
	if val == ARGV[1] then
		return redis.call("DEL", KEYS[1])
	else
		return 0
	end
`)

func AcquireLock(ctx context.Context, rdb *redis.Client, name string, nonce string, ttl ms) bool {
	key := getLockKey(name)
	result, err := acquireScript.Run(ctx, rdb, []string{key}, nonce, ttl).Result()
	if err != nil {
		slog.Error("Error while trying to acquire lock", "error", err, "key", key, "nonce", nonce)
		return false
	}

	if v, ok := result.(int64); ok {
		return v == 1
	}

	return false
}

func CheckLock(ctx context.Context, rdb *redis.Client, name string, nonce string) bool {
	key := getLockKey(name)
	val, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return false
	}
	if err != nil {
		slog.Error("Error while checking lock", "error", err, "key", key, "nonce", nonce)
		return false
	}
	return val == nonce
}

func ReleaseLock(ctx context.Context, rdb *redis.Client, name string, nonce string) bool {
	key := getLockKey(name)
	result, err := releaseScript.Run(ctx, rdb, []string{key}, nonce).Result()
	if err != nil {
		slog.Error("Error while releasing lock", "error", err, "key", key, "nonce", nonce)
		return false
	}

	if v, ok := result.(int64); ok {
		return v == 1
	}

	return false
}
