
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

    const startPolling = useCallback((interval: number = 15000) => { // Increased to 15 seconds
        if (pollingInterval.current || !isActiveGeneration.current) {
            console.log('⏭️ Skipping polling start - already polling or no active generation');
            return;
        }
        console.log(`🔄 Starting conservative polling (${interval}ms interval)...`);
        
        pollingInterval.current = window.setInterval(() => {
            const timeSinceUpdate = Date.now() - lastUpdateTime.current;
            
            // Only poll if we haven't had updates recently AND there's active generation
            if (timeSinceUpdate < 10000 || !isActiveGeneration.current) {
                console.log('⏭️ Skipping poll - recent update or no active generation');
                return;
            }
            
            console.log('📡 Polling for story updates...');
            queryClient.invalidateQueries({ queryKey: ['story', storyId] });
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

    const updateLastUpdateTime = useCallback(() => {
        lastUpdateTime.current = Date.now();
    }, []);

    const setActiveGeneration = useCallback((active: boolean) => {
        isActiveGeneration.current = active;
        console.log(`📊 Generation status changed: ${active ? 'active' : 'inactive'}`);
        
        if (!active) {
            // Stop polling when generation is complete
            stopPolling();
        }
    }, [stopPolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        startPolling,
        stopPolling,
        forceRefresh,
        updateLastUpdateTime,
        setActiveGeneration,
        isPolling: !!pollingInterval.current
    };
};
