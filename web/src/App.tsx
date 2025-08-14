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
    const [currentNumber, setCurrentNumber] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fadeClass, setFadeClass] = useState('');

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

                    setFadeClass('fade-in');
                    setCurrentNumber(response.value);
                    setTimeout(() => setFadeClass(''), 500);
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
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {currentNumber === null ? (
                    <div
                        style={{
                            color: '#666',
                            fontStyle: 'italic',
                            fontSize: '16px',
                        }}
                    >
                        Waiting for stream...
                    </div>
                ) : (
                    <div className={fadeClass} style={{ fontWeight: 'bold' }}>
                        {currentNumber}
                    </div>
                )}
                <style>
                    {`
                        .fade-in {
                            animation: fadeIn 0.5s ease-in;
                        }
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                                transform: scale(0.8);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                    `}
                </style>
            </div>
        </div>
    );
}

export default App;
