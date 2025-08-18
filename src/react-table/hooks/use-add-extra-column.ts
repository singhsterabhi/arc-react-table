import { Table } from '@tanstack/react-table';
import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash-es';

/**
 * Custom hook to determine if an extra column should be added to fill remaining space.
 * @param table The react-table instance.
 * @param threshold Optional buffer threshold to prevent flickering (default: 5px).
 * @returns Boolean state indicating whether to add an extra column.
 */
export const useAddExtraColumn = <T extends object>(table: Table<T>, threshold = 5) => {
    const [addExtraColumn, setAddExtraColumn] = useState(true);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const scrollContainerRef = table?.options.meta?.scrollContainerRef;

    // Extract table state values to avoid dependencies on the entire table object
    const columnSizing = table.options.state.columnSizing;
    const columnPinning = table.options.state.columnPinning;
    const columnVisibility = table.options.state.columnVisibility;
    const visibleColumnsLength = table.getVisibleLeafColumns().length;

    // Memoize table width calculation
    const getTableWidth = useCallback(() => {
        const leftSize = table.getLeftTotalSize() ?? 0;
        const centerSize = table.getCenterTotalSize() ?? 0;
        const rightSize = table.getRightTotalSize() ?? 0;
        return leftSize + centerSize + rightSize;
    }, [table]);

    // Memoize the calculation function
    const updateExtraColumn = useCallback(() => {
        if (!scrollContainerRef?.current) return;

        const totalTableWidth = getTableWidth();
        const containerWidth = scrollContainerRef.current.offsetWidth || 0;

        // Add buffer threshold to prevent flickering when widths are very close
        setAddExtraColumn(totalTableWidth < containerWidth - threshold);
    }, [getTableWidth, scrollContainerRef, threshold]);

    // Handle resize observer setup and cleanup
    useEffect(() => {
        // Clean up previous observer if it exists
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
        }

        if (!scrollContainerRef?.current) return;

        // Create debounced update function
        const debouncedUpdate = debounce(() => {
            updateExtraColumn();
        }, 100);

        try {
            resizeObserverRef.current = new ResizeObserver(() => {
                debouncedUpdate();
            });

            resizeObserverRef.current.observe(scrollContainerRef.current);
        } catch (error) {
            console.error('Error initializing ResizeObserver:', error);
        }

        // Initial calculation
        updateExtraColumn();

        return () => {
            debouncedUpdate.cancel();
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
        };
    }, [scrollContainerRef, updateExtraColumn]);

    // Handle table state changes
    useEffect(() => {
        updateExtraColumn();
    }, [columnSizing, columnPinning, columnVisibility, visibleColumnsLength, updateExtraColumn]);

    return addExtraColumn;
};
