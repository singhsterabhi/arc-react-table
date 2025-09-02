import { Table } from '@tanstack/react-table';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { debounce } from 'lodash-es';

/**
 * Custom hook to determine if an extra column should be added to fill remaining space.
 * @param table The react-table instance.
 * @param threshold Optional buffer threshold to prevent flickering (default: 5px).
 * @returns Boolean state indicating whether to add an extra column.
 */
export const useAddExtraColumn = <T extends object>(table: Table<T>, threshold = 5) => {
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const scrollContainerRef = table?.options.meta?.scrollContainerRef;

    // Extract table state values to avoid dependencies on the entire table object
    const columnSizing = table.options.state.columnSizing;
    const columnPinning = table.options.state.columnPinning;
    const columnVisibility = table.options.state.columnVisibility;
    const visibleColumnsLength = table.getVisibleLeafColumns().length;

    // Calculate whether to add extra column synchronously using useMemo
    const addExtraColumn = useMemo(() => {
        if (!scrollContainerRef?.current) return false;

        const leftSize = table.getLeftTotalSize() ?? 0;
        const centerSize = table.getCenterTotalSize() ?? 0;
        const rightSize = table.getRightTotalSize() ?? 0;
        const totalTableWidth = leftSize + centerSize + rightSize;
        const containerWidth = scrollContainerRef.current.offsetWidth || 0;

        // Add buffer threshold to prevent flickering when widths are very close
        return totalTableWidth < containerWidth - threshold;
    }, [
        table,
        scrollContainerRef,
        threshold,
        columnSizing,
        columnPinning,
        columnVisibility,
        visibleColumnsLength,
    ]);

    // Store the current calculation in a ref for resize observer
    const currentAddExtraColumn = useRef(addExtraColumn);
    currentAddExtraColumn.current = addExtraColumn;

    // Create state for triggering re-renders when container resizes
    const [, forceUpdate] = useState({});
    const triggerUpdate = useCallback(() => forceUpdate({}), []);

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
            triggerUpdate();
        }, 100);

        try {
            resizeObserverRef.current = new ResizeObserver(() => {
                debouncedUpdate();
            });

            resizeObserverRef.current.observe(scrollContainerRef.current);
        } catch (error) {
            console.error('Error initializing ResizeObserver:', error);
        }

        return () => {
            debouncedUpdate.cancel();
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
        };
    }, [scrollContainerRef, triggerUpdate]);

    return addExtraColumn;
};
