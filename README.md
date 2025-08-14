# connectrpc demo

Demo of Go connectrpc server streaming events to a browser

## Getting Started

### 1. Running the API

```bash
cd api
make
./demoapi
```

### 2. Testing via grpcurl

```bash
cd api
grpcurl -plaintext -import-path ./proto -proto v1/random.proto -d '{}' localhost:8083 random.v1.RandomService/SubscribeRandom
```

### 3. Testing via web

```bash
cd web
bun install
bun run dev
```

## License

This project is licensed under either of

 * MIT license ([LICENSE-MIT](LICENSE-MIT) or
   https://opensource.org/licenses/MIT)
 * Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or
   https://www.apache.org/licenses/LICENSE-2.0)
