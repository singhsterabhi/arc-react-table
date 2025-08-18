import { SortingState } from '@tanstack/react-table';
import { useCallback, useState, useEffect } from 'react';

export const useSorting = (
    initialSorting: SortingState | undefined,
    onSortingChange: ((sorting: SortingState) => void) | undefined,
) => {
    const [sortingState, setSortingState] = useState<SortingState>(() => initialSorting ?? []);

    useEffect(() => {
        setSortingState(initialSorting ?? []);
    }, [initialSorting]);

    // Handle sorting change
    const handleSortingChange = useCallback(
        (updaterOrValue: SortingState | ((prev: SortingState) => SortingState)) => {
            setSortingState((prevState) => {
                const newSorting =
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState)
                        : updaterOrValue;

                if (onSortingChange) {
                    onSortingChange(newSorting);
                }
                return newSorting;
            });
        },
        [onSortingChange],
    );

    return {
        sortingState,
        handleSortingChange,
    };
};
