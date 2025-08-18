import { useEffect, useRef, useCallback, useMemo } from 'react';
import { VisibilityState, ColumnSizingState, Table, Column } from '@tanstack/react-table';
import isEqual from 'lodash/isEqual';

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

export const useTableConfigPersistence = ({
    tableConfigKey,
    enableTableConfigPersistence,
    table,
    debounceTime = 300,
}: UseTableConfigPersistenceProps) => {
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const prevConfigRef = useRef<TableConfig | null>(null);

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

    // Memoize column capabilities for efficient access
    const columnCapabilities = useMemo(() => {
        return {
            canHideColumns: allColumns.some(
                (col) =>
                    col.getCanHide() === true ||
                    (col.columnDef.enableHiding !== false && table.options.enableHiding !== false),
            ),
            canResizeColumns: allColumns.some(
                (col) =>
                    col.getCanResize() === true ||
                    (col.columnDef.enableResizing !== false &&
                        table.options.enableColumnResizing !== false),
            ),
            canPinColumns: allColumns.some(
                (col) =>
                    col.getCanPin() === true ||
                    (col.columnDef.enablePinning !== false &&
                        table.options.enableColumnPinning !== false),
            ),
        };
    }, [
        allColumns,
        table.options.enableHiding,
        table.options.enableColumnResizing,
        table.options.enableColumnPinning,
    ]);

    // Function to get current table config
    const getCurrentTableConfig = useCallback(() => {
        const state = table.getState();
        return {
            columnVisibility: state.columnVisibility,
            columnOrder: state.columnOrder,
            columnSizing: state.columnSizing,
            columnPinning: state.columnPinning,
            columnSignatures: columnSignaturesMap,
        };
    }, [table, columnSignaturesMap]);

    // Load configuration on mount
    const loadTableConfig = useCallback(() => {
        if (!enableTableConfigPersistence || !tableConfigKey) return;

        try {
            const savedConfig = localStorage.getItem(`table-config-${tableConfigKey}`);
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                const allColumnIds = allColumns.map((col) => col.id);

                // Create a set of valid columns by comparing signatures
                const validColumns = new Set<string>();

                // If we have column signatures stored, validate each column
                if (config.columnSignatures) {
                    // For each column in the saved config
                    Object.entries(config.columnSignatures).forEach(([colId, signature]) => {
                        // If column still exists in current table
                        if (columnSignaturesMap[colId]) {
                            // Check if signature matches
                            if (columnSignaturesMap[colId] === signature) {
                                validColumns.add(colId);
                            } else {
                                console.log(
                                    `Column ${colId} structure has changed, not applying its saved configuration`,
                                );
                            }
                        }
                    });
                } else {
                    // For backward compatibility, if no signatures stored, just use all current columns
                    allColumnIds.forEach((id) => validColumns.add(id));
                }

                // Validate and apply saved column visibility if hiding is enabled
                if (config.columnVisibility && columnCapabilities.canHideColumns) {
                    const validatedVisibility = Object.entries(config.columnVisibility)
                        .filter(([colId]) => validColumns.has(colId))
                        .reduce<VisibilityState>((acc, [colId, isVisible]) => {
                            acc[colId] = isVisible as boolean;
                            return acc;
                        }, {});

                    if (Object.keys(validatedVisibility).length > 0) {
                        table.setColumnVisibility(validatedVisibility);
                    }
                }

                // Validate and apply saved column order if reordering is enabled
                if (config.columnOrder) {
                    const validatedOrder = config.columnOrder.filter((colId: string) =>
                        validColumns.has(colId),
                    );

                    // Only apply if we have valid columns
                    if (validatedOrder.length > 0) {
                        table.setColumnOrder(validatedOrder);
                    }
                }

                // Validate and apply saved column sizing if resizing is enabled
                if (config.columnSizing && columnCapabilities.canResizeColumns) {
                    const validatedSizing = Object.entries(config.columnSizing)
                        .filter(([colId]) => validColumns.has(colId))
                        .reduce<ColumnSizingState>((acc, [colId, size]) => {
                            acc[colId] = size as number;
                            return acc;
                        }, {});

                    if (Object.keys(validatedSizing).length > 0) {
                        table.setColumnSizing(validatedSizing);
                    }
                }

                // Validate and apply saved column pinning if pinning is enabled
                if (config.columnPinning && columnCapabilities.canPinColumns) {
                    const validatedPinning = { left: [], right: [] };

                    if (Array.isArray(config.columnPinning.left)) {
                        validatedPinning.left = config.columnPinning.left.filter((colId: string) =>
                            validColumns.has(colId),
                        );
                    }

                    if (Array.isArray(config.columnPinning.right)) {
                        validatedPinning.right = config.columnPinning.right.filter(
                            (colId: string) => validColumns.has(colId),
                        );
                    }

                    table.setColumnPinning(validatedPinning);
                }
            }

            // Save current config as previous for comparison
            prevConfigRef.current = getCurrentTableConfig();
        } catch (error) {
            console.error('Error loading table configuration:', error);
        }
    }, [
        enableTableConfigPersistence,
        tableConfigKey,
        allColumns,
        columnSignaturesMap,
        columnCapabilities,
        table,
        getCurrentTableConfig,
    ]);

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
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            saveTableConfig();
            debounceTimerRef.current = null;
        }, debounceTime);
    }, [debounceTime, saveTableConfig]);

    // Load config on mount
    useEffect(() => {
        if (!enableTableConfigPersistence || !tableConfigKey) return;

        loadTableConfig();

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [enableTableConfigPersistence, tableConfigKey, loadTableConfig]);

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
