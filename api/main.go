package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"

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
	// TODO: Implement streaming logic
	return connect.NewError(connect.CodeUnimplemented, errors.New("not implemented yet"))
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
