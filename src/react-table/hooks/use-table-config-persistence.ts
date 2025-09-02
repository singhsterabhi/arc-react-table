import { useEffect, useRef, useCallback, useMemo } from 'react';
import {
    VisibilityState,
    ColumnSizingState,
    Table,
    Column,
    InitialTableState,
} from '@tanstack/react-table';
import { isEqual } from 'lodash-es';

// Special columns that should not be reordered by users
const SPECIAL_COLUMNS = ['react-table-row-expand', 'react-table-row-select'] as const;

interface UseTableConfigPersistenceProps {
    tableConfigKey?: string;
    enableTableConfigPersistence: boolean;
    table: Table<any>;
    debounceTime?: number;
}

interface TableConfig {
    columnVisibility: VisibilityState;
    columnOrder: string[];
    columnSizing: ColumnSizingState;
    columnPinning: { left?: string[]; right?: string[] };
    columnSignatures: Record<string, string>;
}

// Helper function to create a signature for a single column
const createColumnSignature = (column: Column<any, unknown>) => {
    // Extract safe properties that exist on all column types
    const metadata: Record<string, any> = {
        id: column.id,
        // Include header value when it's a string
        header: typeof column.columnDef.header === 'string' ? column.columnDef.header : undefined,
    };

    // Safely add optional properties if they exist
    if ('size' in column.columnDef) {
        metadata.width = column.columnDef.size;
    }

    if ('enableResizing' in column.columnDef) {
        metadata.enableResizing = column.columnDef.enableResizing;
    }

    if ('enableHiding' in column.columnDef) {
        metadata.enableHiding = column.columnDef.enableHiding;
    }

    if ('enablePinning' in column.columnDef) {
        metadata.enablePinning = column.columnDef.enablePinning;
    }

    return JSON.stringify(metadata);
};

// Utility function to synchronously load saved table config and merge with initial state
export const getInitialTableStateWithPersistedConfig = (
    tableConfigKey?: string,
    enableTableConfigPersistence?: boolean,
    baseInitialState?: Partial<InitialTableState>,
    allColumns?: Column<any>[],
): Partial<InitialTableState> => {
    if (!enableTableConfigPersistence || !tableConfigKey) {
        return baseInitialState || {};
    }

    try {
        const savedConfig = localStorage.getItem(`table-config-${tableConfigKey}`);
        if (!savedConfig) {
            return baseInitialState || {};
        }

        const config = JSON.parse(savedConfig);

        // If we don't have columns info yet, just return base state
        if (!allColumns || allColumns.length === 0) {
            return baseInitialState || {};
        }

        // Create column signatures for validation
        const columnSignaturesMap: Record<string, string> = {};
        allColumns.forEach((col) => {
            columnSignaturesMap[col.id] = createColumnSignature(col);
        });

        const allColumnIds = allColumns.map((col) => col.id);

        // Create a set of valid columns by comparing signatures
        const validColumns = new Set<string>();

        // If we have column signatures stored, validate each column
        if (config.columnSignatures) {
            Object.entries(config.columnSignatures).forEach(([colId, signature]) => {
                if (columnSignaturesMap[colId] && columnSignaturesMap[colId] === signature) {
                    validColumns.add(colId);
                }
            });
        } else {
            // For backward compatibility, if no signatures stored, just use all current columns
            allColumnIds.forEach((id) => validColumns.add(id));
        }

        // TEMPORARY: If no valid columns, try using all columns (bypass signature validation)
        if (validColumns.size === 0) {
            allColumnIds.forEach((id) => validColumns.add(id));
        }

        const mergedState: Partial<InitialTableState> = { ...baseInitialState };

        // Note: We're not restoring pagination state as it's typically session-specific
        // Only restore column-related state that should persist

        // Merge column visibility
        if (config.columnVisibility) {
            const validatedVisibility = Object.entries(config.columnVisibility)
                .filter(([colId]) => validColumns.has(colId))
                .reduce<VisibilityState>((acc, [colId, isVisible]) => {
                    acc[colId] = isVisible as boolean;
                    return acc;
                }, {});

            if (Object.keys(validatedVisibility).length > 0) {
                mergedState.columnVisibility = {
                    ...baseInitialState?.columnVisibility,
                    ...validatedVisibility,
                };
            }
        }

        // Merge column order
        if (config.columnOrder) {
            const savedOrderWithoutSpecialCols = config.columnOrder.filter(
                (colId: string) => !SPECIAL_COLUMNS.includes(colId as any),
            );

            const validatedOrder = savedOrderWithoutSpecialCols.filter((colId: string) =>
                validColumns.has(colId),
            );

            if (validatedOrder.length > 0) {
                const existingSpecialColumns: string[] = [];
                if (allColumnIds.includes('react-table-row-expand')) {
                    existingSpecialColumns.push('react-table-row-expand');
                }
                if (allColumnIds.includes('react-table-row-select')) {
                    existingSpecialColumns.push('react-table-row-select');
                }

                const reorderableColumns = validatedOrder.filter(
                    (colId: string) => !SPECIAL_COLUMNS.includes(colId as any),
                );

                mergedState.columnOrder = [...existingSpecialColumns, ...reorderableColumns];
            }
        }

        // Merge column sizing
        if (config.columnSizing) {
            const validatedSizing = Object.entries(config.columnSizing)
                .filter(([colId]) => validColumns.has(colId))
                .reduce<ColumnSizingState>((acc, [colId, size]) => {
                    acc[colId] = size as number;
                    return acc;
                }, {});

            if (Object.keys(validatedSizing).length > 0) {
                mergedState.columnSizing = {
                    ...baseInitialState?.columnSizing,
                    ...validatedSizing,
                };
            }
        }

        // Merge column pinning
        if (config.columnPinning) {
            const validatedPinning = { left: [], right: [] };

            if (Array.isArray(config.columnPinning.left)) {
                validatedPinning.left = config.columnPinning.left.filter((colId: string) =>
                    validColumns.has(colId),
                );
            }

            if (Array.isArray(config.columnPinning.right)) {
                validatedPinning.right = config.columnPinning.right.filter((colId: string) =>
                    validColumns.has(colId),
                );
            }

            mergedState.columnPinning = validatedPinning;
        }

        return mergedState;
    } catch (error) {
        console.error('Error loading persisted table configuration:', error);
        return baseInitialState || {};
    }
};

export const useTableConfigPersistence = ({
    tableConfigKey,
    enableTableConfigPersistence,
    table,
    debounceTime = 300,
}: UseTableConfigPersistenceProps) => {
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const prevConfigRef = useRef<TableConfig | null>(null);
    const isLoadingConfigRef = useRef<boolean>(false);

    // Memoize all leaf columns - will only change if table structure changes
    const allColumns = useMemo(() => table.getAllLeafColumns(), [table]);

    // Memoize column signatures
    const columnSignaturesMap = useMemo(() => {
        const signatures: Record<string, string> = {};
        allColumns.forEach((col) => {
            signatures[col.id] = createColumnSignature(col);
        });
        return signatures;
    }, [allColumns]);

    // Function to get current table config
    const getCurrentTableConfig = useCallback(() => {
        const state = table.getState();
        // Filter out special columns from columnOrder when saving
        const userColumnOrder = state.columnOrder.filter(
            (colId: string) => !SPECIAL_COLUMNS.includes(colId as any),
        );

        return {
            columnVisibility: state.columnVisibility,
            columnOrder: userColumnOrder, // Only save user-reorderable columns
            columnSizing: state.columnSizing,
            columnPinning: state.columnPinning,
            columnSignatures: columnSignaturesMap,
        };
    }, [table, columnSignaturesMap]);

    // Save configuration function
    const saveTableConfig = useCallback(() => {
        if (!enableTableConfigPersistence || !tableConfigKey) return;

        try {
            const currentConfig = getCurrentTableConfig();

            // Skip if nothing has changed
            if (prevConfigRef.current && isEqual(prevConfigRef.current, currentConfig)) {
                return;
            }

            // Update previous config
            prevConfigRef.current = currentConfig;

            // Save to localStorage
            localStorage.setItem(`table-config-${tableConfigKey}`, JSON.stringify(currentConfig));
        } catch (error) {
            console.error('Error saving table configuration:', error);
        }
    }, [enableTableConfigPersistence, tableConfigKey, getCurrentTableConfig]);

    // Debounced save function
    const debouncedSave = useCallback(() => {
        // Don't save if we're currently loading config to prevent circular updates
        if (isLoadingConfigRef.current) {
            return;
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            saveTableConfig();
            debounceTimerRef.current = null;
        }, debounceTime);
    }, [debounceTime, saveTableConfig]);

    // NOTE: Config loading is now handled synchronously during initial render
    // This effect just handles cleanup
    useEffect(() => {
        if (!enableTableConfigPersistence || !tableConfigKey) return;

        // Set the initial previous config to avoid immediate saves on mount
        prevConfigRef.current = getCurrentTableConfig();

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [enableTableConfigPersistence, tableConfigKey, getCurrentTableConfig]);

    // Watch for column visibility changes
    useEffect(() => {
        if (!enableTableConfigPersistence || !tableConfigKey) return;
        debouncedSave();
    }, [
        enableTableConfigPersistence,
        tableConfigKey,
        debouncedSave,
        table.getState().columnVisibility,
    ]);

    // Watch for column order changes
    useEffect(() => {
        if (!enableTableConfigPersistence || !tableConfigKey) return;
        debouncedSave();
    }, [enableTableConfigPersistence, tableConfigKey, debouncedSave, table.getState().columnOrder]);

    // Watch for column sizing changes
    useEffect(() => {
        if (!enableTableConfigPersistence || !tableConfigKey) return;
        debouncedSave();
    }, [
        enableTableConfigPersistence,
        tableConfigKey,
        debouncedSave,
        table.getState().columnSizing,
    ]);

    // Watch for column pinning changes
    useEffect(() => {
        if (!enableTableConfigPersistence || !tableConfigKey) return;
        debouncedSave();
    }, [
        enableTableConfigPersistence,
        tableConfigKey,
        debouncedSave,
        table.getState().columnPinning,
    ]);
};
