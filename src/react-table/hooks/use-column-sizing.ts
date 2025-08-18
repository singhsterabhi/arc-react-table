import { ColumnSizingState } from '@tanstack/react-table';
import { useCallback, useState, useEffect } from 'react';

export const useColumnSizing = (
    initialColumnSizing: ColumnSizingState | undefined,
    onColumnSizingChange: ((columnSizing: ColumnSizingState) => void) | undefined,
) => {
    const [columnSizingState, setColumnSizingState] = useState<ColumnSizingState>(
        () => initialColumnSizing ?? {},
    );

    useEffect(() => {
        setColumnSizingState(initialColumnSizing ?? {});
    }, [initialColumnSizing]);

    const handleColumnSizingChange = useCallback(
        (updaterOrValue: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
            setColumnSizingState((prevState) => {
                const newColumnSizing =
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState)
                        : updaterOrValue;

                if (onColumnSizingChange) {
                    onColumnSizingChange(newColumnSizing);
                }
                return newColumnSizing;
            });
        },
        [onColumnSizingChange],
    );

    return {
        columnSizingState,
        handleColumnSizingChange,
    };
};
