.PHONY: clean build protoc format lib check test clean-certs race

PBDIR = pb

# all: protoc lib format check build
all: lib format check build

protoc:
	echo no-op
# 	mkdir -pv $(PBDIR)
# 	protoc --go_out=$(PBDIR) --go_opt=paths=source_relative \
# 		--go-grpc_out=$(PBDIR) --go-grpc_opt=paths=source_relative \
# 		--proto_path=internal/api/proto internal/api/proto/*.proto

lib:
	go build ./...

format:
	gofumpt -w -l .

check:
	golangci-lint run

build:
	go build ./cmd/worker-server
	go build ./cmd/worker-cli
	go build ./cmd/random-server

cli:
	go build ./cmd/worker-cli

server:
	go build ./cmd/worker-server

random-server:
	go build ./cmd/random-server

coverage:
	go test -race -count=1 -v ./... -coverprofile=coverage.out
	go tool cover -func=coverage.out
	go tool cover -html=coverage.out

test:
	go test -race -count=1 -v ./...

clean:
	rm -f ./worker-server ./worker-cli ./random-server ./coverage.out
