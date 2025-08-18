import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Row } from '@tanstack/react-table';
import { RowPollingConfig, UpdateRowData } from '../types';

// Conditional import for optional dependency
let useQuery: any;
try {
    const reactQuery = require('@tanstack/react-query');
    useQuery = reactQuery.useQuery;
} catch (e) {
    // @tanstack/react-query is not available
}

interface UseRowPollingProps {
    row: Row<any>;
    pollingConfig: RowPollingConfig | null;
    defaultInterval?: number;
    updateRowData?: UpdateRowData;
}

export const useRowPolling = ({
    row,
    pollingConfig,
    defaultInterval = 30000,
    updateRowData,
}: UseRowPollingProps) => {
    // Internal state to control polling independently of config
    const [isPollingEnabled, setIsPollingEnabled] = useState(false);

    // Use ref to track timeout to prevent multiple timeouts
    const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoize query key since row.id and row.index should be stable
    const queryKey = useMemo(() => ['row-polling', row.id ?? row.index], [row.id, row.index]);

    // Extract polling function and interval to stable references
    const onPoll = pollingConfig?.onPoll;
    const pollingInterval = pollingConfig?.interval ?? defaultInterval;
    const isConfigEnabled = pollingConfig?.enabled;

    // Determine if polling should be active
    const shouldPoll = isConfigEnabled && isPollingEnabled;

    // Create a pure query function that returns data
    const queryFn = useCallback(() => {
        if (!onPoll) {
            throw new Error('No polling function provided');
        }

        // Call the pure onPoll function that returns data
        return onPoll(row);
    }, [onPoll, row]);

    const query = useQuery
        ? useQuery({
              queryKey,
              queryFn,
              enabled: shouldPoll,
              refetchInterval: pollingInterval,
              select: pollingConfig?.select || undefined,
              // Disable automatic retries for polling to avoid excessive API calls
              retry: false,
              // Don't refetch on window focus for polling queries
              refetchOnWindowFocus: false,
              // Don't refetch on reconnect for polling queries
              refetchOnReconnect: false,
              staleTime: 0,
              gcTime: 0,
          })
        : { data: null, isLoading: false, error: null };

    // Handle side effect: Update row data when new data is received
    useEffect(() => {
        if (query.data && updateRowData && (row.id || row.index !== undefined)) {
            const rowId = row.id ?? String(row.index);
            updateRowData(rowId, query.data);
        }
    }, [query.data, updateRowData, row.id, row.index]);

    // Helper to clear existing timeout
    const clearPollingTimeout = useCallback(() => {
        if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
        }
    }, []);

    // Helper to set polling timeout
    const setPollingTimeout = useCallback(
        (delay: number) => {
            clearPollingTimeout();
            pollingTimeoutRef.current = setTimeout(() => {
                setIsPollingEnabled(true);
                pollingTimeoutRef.current = null;
            }, delay);
        },
        [clearPollingTimeout],
    );

    // Start polling when config changes to enabled, with initial delay
    useEffect(() => {
        if (isConfigEnabled) {
            // Add initial delay before enabling polling
            setPollingTimeout(pollingInterval);
        } else {
            setIsPollingEnabled(false);
            clearPollingTimeout();
        }

        // Cleanup on unmount or config change
        return clearPollingTimeout;
    }, [isConfigEnabled, pollingInterval, setPollingTimeout, clearPollingTimeout]);

    const startPolling = useCallback(() => {
        if (isConfigEnabled) {
            // Add initial delay before enabling polling
            setPollingTimeout(pollingInterval);
        }
    }, [isConfigEnabled, pollingInterval, setPollingTimeout]);

    const stopPolling = useCallback(() => {
        setIsPollingEnabled(false);
        clearPollingTimeout();
    }, [clearPollingTimeout]);

    return {
        startPolling,
        stopPolling,
    };
};
