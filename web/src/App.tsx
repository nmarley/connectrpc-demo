import { create } from '@bufbuild/protobuf';
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { useEffect, useState } from 'react';
import { RandomService, SubscribeRequestSchema } from './gen/v1/random_pb';
import './App.css';

const transport = createConnectTransport({
    baseUrl: '/api',
    useBinaryFormat: false,
    interceptors: [],
});

const client = createClient(RandomService, transport);

function App() {
    const [randomNumbers, setRandomNumbers] = useState<
        { id: string; value: number }[]
    >([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const subscribe = async () => {
            try {
                setError(null);
                setIsConnected(true);

                for await (const response of client.subscribeRandom(
                    create(SubscribeRequestSchema),
                )) {
                    setRandomNumbers((prev) => [
                        ...prev.slice(-9),
                        {
                            id: `${Date.now()}-${Math.random()}`,
                            value: response.value,
                        },
                    ]);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Connection failed',
                );
                setIsConnected(false);
            }
        };

        subscribe();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>ConnectRPC Random Number Stream</h1>

            <div style={{ marginBottom: '20px' }}>
                Status:{' '}
                {isConnected ? (
                    <span style={{ color: 'green' }}>Connected</span>
                ) : (
                    <span style={{ color: 'red' }}>Disconnected</span>
                )}
            </div>

            {error && (
                <div style={{ color: 'red', marginBottom: '20px' }}>
                    Error: {error}
                </div>
            )}

            <h2>Latest Random Numbers:</h2>
            <div
                style={{
                    border: '1px solid #ccc',
                    padding: '10px',
                    minHeight: '200px',
                    backgroundColor: '#f9f9f9',
                }}
            >
                {randomNumbers.length === 0 ? (
                    <p>Waiting for numbers...</p>
                ) : (
                    randomNumbers.map((item, index) => (
                        <div
                            key={item.id}
                            style={{
                                padding: '5px 0',
                                fontSize: '18px',
                                opacity:
                                    index === randomNumbers.length - 1
                                        ? 1
                                        : 0.7 -
                                          (randomNumbers.length - index - 1) *
                                              0.1,
                            }}
                        >
                            {item.value}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
