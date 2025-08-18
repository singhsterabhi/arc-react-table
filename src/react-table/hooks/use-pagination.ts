import { PaginationState } from '@tanstack/react-table';
import { useCallback, useState, useEffect } from 'react';

export const usePagination = (
    initialPagination: PaginationState | undefined,
    onPaginationChange: ((pagination: PaginationState) => void) | undefined,
    totalPageCount: number,
) => {
    const [paginationState, setPaginationState] = useState<PaginationState>(
        () => initialPagination ?? { pageIndex: 0, pageSize: 25 },
    );

    useEffect(() => {
        setPaginationState(initialPagination ?? { pageIndex: 0, pageSize: 25 });
    }, [initialPagination]);

    const handlePaginationChange = useCallback(
        (updaterOrValue: PaginationState | ((prev: PaginationState) => PaginationState)) => {
            setPaginationState((prevState) => {
                // 1. Determine the intended new state from the updater or value
                const intendedState =
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState)
                        : updaterOrValue;

                let newPageIndex = intendedState.pageIndex;
                const newPageSize = intendedState.pageSize;

                // 2. Validate and clamp pageIndex based on newPageSize and totalPageCount
                // Ensure pageSize is at least 1 to avoid division by zero or negative
                const validatedPageSize = Math.max(1, newPageSize);
                // Calculate total number of pages. Ensure at least 1 page, even if totalPageCount is 0.
                const totalPages = Math.max(1, Math.ceil(totalPageCount / validatedPageSize));

                if (newPageIndex >= totalPages) {
                    newPageIndex = totalPages - 1; // Clamp to last page (0-indexed)
                }
                if (newPageIndex < 0) {
                    newPageIndex = 0; // Clamp to first page
                }

                const finalPagination: PaginationState = {
                    pageIndex: newPageIndex,
                    pageSize: validatedPageSize, // Use validated page size
                };

                // 3. Call onPaginationChange if provided and if the state has actually changed
                if (onPaginationChange) {
                    if (
                        finalPagination.pageIndex !== prevState.pageIndex ||
                        finalPagination.pageSize !== prevState.pageSize
                    ) {
                        onPaginationChange(finalPagination);
                    }
                }

                return finalPagination;
            });
        },
        [onPaginationChange, totalPageCount],
    );

    return {
        paginationState,
        handlePaginationChange,
    };
};
