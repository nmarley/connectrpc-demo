import { create } from '@bufbuild/protobuf';
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { useEffect, useRef, useState } from 'react';
import { RandomService, SubscribeRequestSchema } from './gen/v1/random_pb';
import './App.css';

const transport = createConnectTransport({
    baseUrl: '/api',
    useBinaryFormat: false,
    interceptors: [],
});

const client = createClient(RandomService, transport);
const subscribeRequest = create(SubscribeRequestSchema);

function App() {
    const [randomNumbers, setRandomNumbers] = useState<
        { id: string; value: number }[]
    >([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        abortControllerRef.current = new AbortController();
        const abortController = abortControllerRef.current;

        const subscribe = async () => {
            try {
                setError(null);
                setIsConnected(true);

                for await (const response of client.subscribeRandom(
                    subscribeRequest,
                    { signal: abortController.signal },
                )) {
                    if (abortController.signal.aborted) break;

                    setRandomNumbers((prev) => [
                        ...prev.slice(-9),
                        {
                            id: `${Date.now()}-${Math.random()}`,
                            value: response.value,
                        },
                    ]);
                }
            } catch (err) {
                if (!abortController.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Connection failed',
                    );
                    setIsConnected(false);
                }
            }
        };

        subscribe();

        return () => {
            abortController.abort();
            setIsConnected(false);
        };
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

            <h2>Live Random Number Stream:</h2>
            <div
                style={{
                    border: '1px solid #ccc',
                    height: '80px',
                    backgroundColor: '#f9f9f9',
                    color: '#333',
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '18px',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {randomNumbers.length === 0 ? (
                    <div
                        style={{
                            padding: '0 20px',
                            color: '#666',
                            fontStyle: 'italic',
                        }}
                    >
                        Waiting for stream...
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            whiteSpace: 'nowrap',
                            animation: 'ticker 20s linear infinite',
                        }}
                    >
                        {randomNumbers.map((item) => (
                            <span key={item.id} style={{ marginRight: '40px' }}>
                                ... {item.value} ...
                            </span>
                        ))}
                    </div>
                )}
                <style>
                    {`
                        @keyframes ticker {
                            from {
                                transform: translateX(100%);
                            }
                            to {
                                transform: translateX(-100%);
                            }
                        }
                    `}
                </style>
            </div>
        </div>
    );
}

export default App;
