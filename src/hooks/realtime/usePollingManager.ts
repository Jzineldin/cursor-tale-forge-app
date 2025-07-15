
import { useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const usePollingManager = (storyId: string | undefined) => {
    const queryClient = useQueryClient();
    const pollingInterval = useRef<number | null>(null);
    const lastUpdateTime = useRef<number>(Date.now());
    const isActiveGeneration = useRef<boolean>(false);

    const forceRefresh = useCallback(() => {
        console.log('🔄 Force refreshing story data...');
        lastUpdateTime.current = Date.now();
        queryClient.invalidateQueries({ queryKey: ['story', storyId] });
        queryClient.refetchQueries({ queryKey: ['story', storyId] });
    }, [queryClient, storyId]);

    const startPolling = useCallback((interval: number = 10000) => { // Increased to 10 seconds
        if (pollingInterval.current || !isActiveGeneration.current) return;
        console.log(`🔄 Starting conservative polling (${interval}ms interval)...`);
        
        pollingInterval.current = window.setInterval(() => {
            const timeSinceUpdate = Date.now() - lastUpdateTime.current;
            
            // Only poll if we haven't had updates recently AND there's active generation
            if (timeSinceUpdate < 5000 || !isActiveGeneration.current) {
                console.log('⏭️ Skipping poll - recent update or no active generation');
                return;
            }
            
            console.log('📡 Polling for story updates...');
            queryClient.invalidateQueries({ queryKey: ['story', storyId] });
            queryClient.refetchQueries({ queryKey: ['story', storyId] });
        }, interval);
    }, [queryClient, storyId]);

    const stopPolling = useCallback(() => {
        if (pollingInterval.current) {
            console.log('✅ Stopping polling');
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
        isActiveGeneration.current = false;
    }, []);

    const setActiveGeneration = useCallback((active: boolean) => {
        console.log(`🎯 Setting active generation: ${active}`);
        isActiveGeneration.current = active;
        
        if (active) {
            startPolling();
        } else {
            stopPolling();
        }
    }, [startPolling, stopPolling]);

    const updateLastUpdateTime = useCallback(() => {
        lastUpdateTime.current = Date.now();
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, []);

    return {
        startPolling,
        stopPolling,
        forceRefresh,
        updateLastUpdateTime,
        setActiveGeneration
    };
};
