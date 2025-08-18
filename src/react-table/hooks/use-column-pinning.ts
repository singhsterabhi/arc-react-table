import { ColumnPinningState } from '@tanstack/react-table';
import { useCallback, useState, useEffect } from 'react';

export const useColumnPinning = (
    initialColumnPinning: ColumnPinningState | undefined,
    onColumnPinningChange: ((columnPinning: ColumnPinningState) => void) | undefined,
) => {
    const [columnPinningState, setColumnPinningState] = useState<ColumnPinningState>(
        () => initialColumnPinning ?? { left: [], right: [] },
    );

    useEffect(() => {
        setColumnPinningState(initialColumnPinning ?? { left: [], right: [] });
    }, [initialColumnPinning]);

    // Handle column pinning change
    const handleColumnPinningChange = useCallback(
        (
            updaterOrValue: ColumnPinningState | ((prev: ColumnPinningState) => ColumnPinningState),
        ) => {
            setColumnPinningState((prevState) => {
                const newColumnPinning =
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState)
                        : updaterOrValue;

                if (onColumnPinningChange) {
                    onColumnPinningChange(newColumnPinning);
                }
                return newColumnPinning;
            });
        },
        [onColumnPinningChange],
    );

    return {
        columnPinningState,
        handleColumnPinningChange,
    };
};
