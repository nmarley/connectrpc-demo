package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	pb "demoapi/pb/v1"
	"demoapi/pb/v1/pbconnect"
)

type randomService struct{}

func (s *randomService) SubscribeRandom(
	ctx context.Context,
	req *connect.Request[pb.SubscribeRequest],
	stream *connect.ServerStream[pb.Number],
) error {
	sendNumber := func() error {
		randomNum := rand.Int31()
		number := &pb.Number{Value: randomNum}
		if err := stream.Send(number); err != nil {
			return err
		}
		log.Printf("Sent random number: %d", randomNum)
		return nil
	}

	// Send first number immediately
	if err := sendNumber(); err != nil {
		return err
	}

	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := sendNumber(); err != nil {
				return err
			}
		}
	}
}

func main() {
	randomSvc := &randomService{}
	path, handler := pbconnect.NewRandomServiceHandler(randomSvc)

	port := 8083

	mux := http.NewServeMux()
	mux.Handle(path, handler)

	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: h2c.NewHandler(mux, &http2.Server{}),
	}

	fmt.Printf("Starting server on :%d\n", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
