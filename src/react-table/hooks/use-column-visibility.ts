import { VisibilityState } from '@tanstack/react-table';
import { useCallback, useState, useEffect } from 'react';

export const useColumnVisibility = (
    initialColumnVisibility: VisibilityState | undefined,
    onColumnVisibilityChange: ((columnVisibility: VisibilityState) => void) | undefined,
) => {
    const [columnVisibilityState, setColumnVisibilityState] = useState<VisibilityState>(
        () => initialColumnVisibility ?? {},
    );

    useEffect(() => {
        setColumnVisibilityState(initialColumnVisibility ?? {});
    }, [initialColumnVisibility]);

    // Handle column visibility change
    const handleColumnVisibilityChange = useCallback(
        (updaterOrValue: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
            setColumnVisibilityState((prevState) => {
                const newColumnVisibility =
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState)
                        : updaterOrValue;

                if (onColumnVisibilityChange) {
                    onColumnVisibilityChange(newColumnVisibility);
                }
                return newColumnVisibility;
            });
        },
        [onColumnVisibilityChange],
    );

    return {
        columnVisibilityState,
        handleColumnVisibilityChange,
    };
};
