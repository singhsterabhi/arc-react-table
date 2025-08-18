import { ColumnOrderState } from '@tanstack/react-table';
import { useCallback, useState, useEffect } from 'react';

export const useColumnOrder = (
    initialColumnOrder: ColumnOrderState | undefined,
    onColumnOrderChange: ((columnOrder: ColumnOrderState) => void) | undefined,
) => {
    const [columnOrderState, setColumnOrderState] = useState<ColumnOrderState>(
        () => initialColumnOrder ?? [],
    );

    useEffect(() => {
        setColumnOrderState(initialColumnOrder ?? []);
    }, [initialColumnOrder]);

    // Handle column order change
    const handleColumnOrderChange = useCallback(
        (updaterOrValue: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState)) => {
            setColumnOrderState((prevState) => {
                const newColumnOrder =
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState)
                        : updaterOrValue;

                if (onColumnOrderChange) {
                    onColumnOrderChange(newColumnOrder);
                }
                return newColumnOrder;
            });
        },
        [onColumnOrderChange], // Removed columnOrderState from dependencies
    );

    return {
        columnOrderState,
        handleColumnOrderChange,
    };
};
