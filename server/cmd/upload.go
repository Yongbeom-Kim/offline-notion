package cmd

import (
	"net/http"
	"strconv"

	"github.com/Yongbeom-Kim/offline-notion/server/lib/redis"
)

const DEFAULT_UPLOAD_TIMEOUT = 10000 // 10s

func (a *App) HandleAcquireUploadLock(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	docId := r.PathValue("docId")
	if docId == "" {
		http.Error(w, "Bad Request: document is not specified", http.StatusBadRequest)
		return
	}

	nonce := r.URL.Query().Get("nonce")
	if nonce == "" {
		http.Error(w, "Bad Request: nonce is not specified", http.StatusBadRequest)
		return
	}

	ttlStr := r.URL.Query().Get("ttl")
	var ttl int64
	if ttlStr == "" {
		ttl = DEFAULT_UPLOAD_TIMEOUT
	} else {
		var err error
		ttl, err = strconv.ParseInt(ttlStr, 10, 64)
		if err != nil {
			http.Error(w, "Bad Request: invalid ttl", http.StatusBadRequest)
			return
		}
	}

	if redis.AcquireLock(ctx, a.Redis, docId, nonce, ttl) {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusConflict)
	}
}

func (a *App) HandleReleaseUploadLock(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	docId := r.PathValue("docId")
	if docId == "" {
		http.Error(w, "Bad Request: document is not specified", http.StatusBadRequest)
		return
	}

	nonce := r.URL.Query().Get("nonce")
	if nonce == "" {
		http.Error(w, "Bad Request: nonce is not specified", http.StatusBadRequest)
		return
	}

	if redis.ReleaseLock(ctx, a.Redis, docId, nonce) {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}
}

func (a *App) HandleCheckUploadLock(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	docId := r.PathValue("docId")
	if docId == "" {
		http.Error(w, "Bad Request: document is not specified", http.StatusBadRequest)
		return
	}

	nonce := r.URL.Query().Get("nonce")
	if nonce == "" {
		http.Error(w, "Bad Request: nonce is not specified", http.StatusBadRequest)
		return
	}

	hasLock := redis.CheckLock(ctx, a.Redis, docId, nonce)
	if hasLock {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusConflict)
	}
}
