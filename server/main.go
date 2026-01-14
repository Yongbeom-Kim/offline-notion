package main

import (
	"log"
	"net/http"
)

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func main() {
	http.HandleFunc("/health", healthCheck)
	log.Println("starting on :3001")
	log.Fatal(http.ListenAndServe(":3001", nil))
}
