import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Row } from '@tanstack/react-table';
import { TablePollingConfig, UpdateTableData } from '../types';

// Conditional import for optional dependency
let useQuery: any;
try {
    const reactQuery = require('@tanstack/react-query');
    useQuery = reactQuery.useQuery;
} catch (e) {
    // @tanstack/react-query is not available
}

interface UseTablePollingProps {
    pollingConfig: TablePollingConfig | null;
    defaultInterval?: number;
    updateTableData?: UpdateTableData;
    enabled?: boolean;
    tableConfigKey?: string;
}

interface RowPollingState {
    rowId: string;
    row: Row<any>;
    shouldPoll: boolean;
}

export const useTablePolling = ({
    pollingConfig,
    defaultInterval = 30000,
    updateTableData,
    enabled = true,
    tableConfigKey = 'table-polling-key',
}: UseTablePollingProps) => {
    const [pollingRows, setPollingRows] = useState<Map<string, RowPollingState>>(new Map());
    const [isPollingEnabled, setIsPollingEnabled] = useState(false);

    // Use refs to store stable references and avoid unnecessary closures
    const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const updateTableDataRef = useRef(updateTableData);
    const onPollRef = useRef(pollingConfig?.onPoll);
    const pollingRowsRef = useRef(pollingRows);

    // Update refs when values change
    updateTableDataRef.current = updateTableData;
    onPollRef.current = pollingConfig?.onPoll;
    pollingRowsRef.current = pollingRows;

    const pollingInterval = pollingConfig?.interval ?? defaultInterval;
    const isConfigEnabled = pollingConfig?.enabled;

    // Memoize only the query key as it's used by react-query
    const queryKey = useMemo(() => ['table-polling-stable', tableConfigKey], [tableConfigKey]);

    // Optimize queryFn by using refs to avoid recreating on pollingRows changes
    const queryFn = useCallback(async () => {
        const onPoll = onPollRef.current;
        if (!onPoll) {
            throw new Error('No table polling function provided');
        }

        const currentPollingRows = pollingRowsRef.current;
        const rowsToPoll = Array.from(currentPollingRows.values()).filter(
            (state) => state.shouldPoll,
        );

        if (rowsToPoll.length === 0) {
            return Promise.resolve([]);
        }

        try {
            const result = await onPoll(rowsToPoll.map((state) => state.row));
            return result;
        } catch (error) {
            throw error;
        }
    }, []); // Empty dependencies since we use refs

    const shouldPoll = enabled && isConfigEnabled && isPollingEnabled && pollingRows.size > 0;

    const query = useQuery
        ? useQuery({
              queryKey,
              queryFn,
              enabled: shouldPoll,
              refetchInterval: pollingInterval,
              select: pollingConfig?.select || undefined,
              retry: false,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false,
              staleTime: 0,
              gcTime: 0,
          })
        : { data: null, isLoading: false, error: null };

    // Handle query data updates
    useEffect(() => {
        if (enabled && query.data && updateTableDataRef.current && Array.isArray(query.data)) {
            updateTableDataRef.current(query.data);
        }
    }, [enabled, query.data]);

    // Stable timeout management functions
    const clearPollingTimeout = useCallback(() => {
        if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
        }
    }, []);

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

    // Cleanup effect
    useEffect(() => {
        if (!enabled) return;

        if (!isConfigEnabled && isPollingEnabled) {
            setIsPollingEnabled(false);
            clearPollingTimeout();
        }

        return clearPollingTimeout;
    }, [enabled, isConfigEnabled, isPollingEnabled, clearPollingTimeout]);

    // Polling control effect - simplified dependencies
    useEffect(() => {
        if (!enabled || !isConfigEnabled) return;

        const hasRowsToPoll = Array.from(pollingRows.values()).some((state) => state.shouldPoll);

        if (hasRowsToPoll && !isPollingEnabled) {
            setPollingTimeout(pollingInterval);
        } else if (!hasRowsToPoll && isPollingEnabled) {
            setIsPollingEnabled(false);
            clearPollingTimeout();
        }
    }, [
        enabled,
        isConfigEnabled,
        pollingRows,
        isPollingEnabled,
        pollingInterval,
        setPollingTimeout,
        clearPollingTimeout,
    ]);

    // Optimized row management functions using functional updates to reduce dependencies
    const addRowToPolling = useCallback(
        (row: Row<any>, shouldPoll: boolean = true) => {
            if (!enabled) return;

            const rowId = row.id ?? String(row.index);
            setPollingRows((prev) => {
                const existing = prev.get(rowId);
                if (existing && existing.shouldPoll === shouldPoll) {
                    return prev; // No change needed
                }

                const newMap = new Map(prev);
                newMap.set(rowId, { rowId, row, shouldPoll });
                return newMap;
            });
        },
        [enabled],
    );

    const removeRowFromPolling = useCallback(
        (rowId: string) => {
            if (!enabled) return;

            setPollingRows((prev) => {
                if (!prev.has(rowId)) {
                    return prev; // No change needed
                }

                const newMap = new Map(prev);
                newMap.delete(rowId);
                return newMap;
            });
        },
        [enabled],
    );

    const updateRowPollingState = useCallback(
        (rowId: string, shouldPoll: boolean) => {
            if (!enabled) return;

            setPollingRows((prev) => {
                const existing = prev.get(rowId);
                if (!existing || existing.shouldPoll === shouldPoll) {
                    return prev; // No change needed
                }

                const newMap = new Map(prev);
                newMap.set(rowId, { ...existing, shouldPoll });
                return newMap;
            });
        },
        [enabled],
    );

    const startPolling = useCallback(() => {
        if (!enabled || !isConfigEnabled) return;

        // Use functional update to get current state
        setPollingRows((currentRows) => {
            const hasRowsToPoll = Array.from(currentRows.values()).some(
                (state) => state.shouldPoll,
            );
            if (hasRowsToPoll) {
                setPollingTimeout(pollingInterval);
            }
            return currentRows;
        });
    }, [enabled, isConfigEnabled, pollingInterval, setPollingTimeout]);

    const stopPolling = useCallback(() => {
        if (!enabled) return;

        setIsPollingEnabled(false);
        clearPollingTimeout();
    }, [enabled, clearPollingTimeout]);

    const clearAllRows = useCallback(() => {
        if (!enabled) return;

        setPollingRows(new Map());
        setIsPollingEnabled(false);
        clearPollingTimeout();
    }, [enabled, clearPollingTimeout]);

    return {
        addRowToPolling,
        removeRowFromPolling,
        updateRowPollingState,
        startPolling,
        stopPolling,
        clearAllRows,
    };
};
