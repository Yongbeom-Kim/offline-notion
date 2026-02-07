package main

import (
	"log"
	"net/http"

	"github.com/Yongbeom-Kim/offline-notion/server/cmd"
	"github.com/redis/go-redis/v9"
)

func main() {
	mux := http.NewServeMux()

	rdb := redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "",

		DB: 0,
	})
	defer rdb.Close()

	app := &cmd.App{Redis: rdb}

	mux.HandleFunc("/upload/g/start/{docId}", app.HandleAcquireUploadLock)
	mux.HandleFunc("/upload/g/end/{docId}", app.HandleReleaseUploadLock)
	mux.HandleFunc("/upload/g/check/{docId}", app.HandleCheckUploadLock)
	mux.HandleFunc("GET /health", cmd.HealthCheck)

	server := &http.Server{
		Addr:    ":3001",
		Handler: mux,
	}

	log.Println("starting on :3001")
	log.Fatal(server.ListenAndServe())
}
