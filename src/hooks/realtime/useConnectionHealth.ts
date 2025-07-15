
import { useState, useRef } from 'react';

export const useConnectionHealth = () => {
    const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'failed'>('healthy');
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 3;

    const setHealthy = () => {
        setConnectionHealth('healthy');
        reconnectAttempts.current = 0;
    };

    const setDegraded = () => {
        setConnectionHealth('degraded');
    };

    const setFailed = () => {
        setConnectionHealth('failed');
    };

    const incrementReconnectAttempts = () => {
        reconnectAttempts.current++;
        return reconnectAttempts.current;
    };

    const hasMaxReconnectAttemptsReached = () => {
        return reconnectAttempts.current >= maxReconnectAttempts;
    };

    return {
        connectionHealth,
        setHealthy,
        setDegraded,
        setFailed,
        incrementReconnectAttempts,
        hasMaxReconnectAttemptsReached,
        maxReconnectAttempts
    };
};
