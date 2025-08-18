import { ColumnFiltersState } from '@tanstack/react-table';
import { useCallback, useState, useEffect } from 'react';

export const useColumnFilters = (
    initialColumnFilters: ColumnFiltersState | undefined,
    onColumnFiltersChange: ((columnFilters: ColumnFiltersState) => void) | undefined,
) => {
    const [columnFiltersState, setColumnFiltersState] = useState<ColumnFiltersState>(
        initialColumnFilters ?? [],
    );

    // Sync with prop changes
    useEffect(() => {
        setColumnFiltersState(initialColumnFilters ?? []);
    }, [initialColumnFilters]);

    // Handle column filter change
    const handleColumnFiltersChange = useCallback(
        (
            updaterOrValue: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState),
        ) => {
            setColumnFiltersState((prevFilters) => {
                const newColumnFilters =
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevFilters)
                        : updaterOrValue;

                if (onColumnFiltersChange) {
                    onColumnFiltersChange(newColumnFilters);
                }

                return newColumnFilters;
            });
        },
        [onColumnFiltersChange],
    );

    return {
        columnFiltersState,
        handleColumnFiltersChange,
    };
};
