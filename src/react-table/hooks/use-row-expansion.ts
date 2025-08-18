import { ExpandedState } from '@tanstack/react-table';
import { useCallback, useEffect, useRef, useState, RefObject, MouseEvent } from 'react';

export const useRowExpansion = (
    initialExpanded: ExpandedState | undefined,
    onExpandedChange: ((expanded: ExpandedState) => void) | undefined,
    enableExclusiveRowExpansion: boolean,
    scrollContainerRef: RefObject<HTMLElement>,
) => {
    const [expandedState, setExpandedState] = useState<ExpandedState>(initialExpanded ?? {});
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Function to scroll to a row by its ID
    const scrollToRowById = useCallback(
        (rowId: string) => {
            // Clear any existing timeout before setting a new one
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = null;
            }

            // Use a longer timeout to ensure the DOM has updated fully
            scrollTimeoutRef.current = setTimeout(() => {
                try {
                    if (!scrollContainerRef?.current) {
                        // Fallback to document if no container ref is provided
                        const rowElement = document.getElementById(`row-${rowId}`);
                        if (rowElement) {
                            rowElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
                        }
                        return;
                    }

                    // Use the container ref to find the row element
                    const container = scrollContainerRef.current;
                    const rowElement = container.querySelector(`#row-${rowId}`);

                    if (rowElement && container) {
                        // Calculate scroll position
                        const containerRect = container.getBoundingClientRect();
                        const rowRect = rowElement.getBoundingClientRect();

                        // Scroll the container to make the row visible at the top
                        container.scrollTop =
                            container.scrollTop + (rowRect.top - containerRect.top - 100);
                    }
                } catch (error) {
                    console.error('Error scrolling to row:', error);
                }

                // Clear the ref after execution
                if (scrollTimeoutRef.current) {
                    scrollTimeoutRef.current = null;
                }
            }, 400);
        },
        [scrollContainerRef],
    );

    // Function to scroll to a row from a click event
    const scrollToRowByEvent = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            // Clear any existing timeout before setting a new one
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = null;
            }

            // Use a timeout to ensure the DOM has updated fully after expansion
            scrollTimeoutRef.current = setTimeout(() => {
                try {
                    // Get the clicked element
                    const clickedElement = event.target as HTMLElement;

                    // Find the closest row element - looking for elements with id starting with "row-"
                    let rowElement: HTMLElement | null = clickedElement;
                    while (rowElement && !rowElement.id.startsWith('row-')) {
                        rowElement = rowElement.parentElement;
                    }

                    // If no row element found, exit
                    if (!rowElement) {
                        console.warn('Could not find row element from click event');
                        return;
                    }

                    if (!scrollContainerRef?.current) {
                        // Fallback to document if no container ref is provided
                        rowElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
                        return;
                    }

                    // Use the container ref for scrolling
                    const container = scrollContainerRef.current;

                    // Calculate scroll position
                    const containerRect = container.getBoundingClientRect();
                    const rowRect = rowElement.getBoundingClientRect();

                    // Scroll the container to make the row visible at the top
                    container.scrollTop =
                        container.scrollTop + (rowRect.top - containerRect.top - 100);
                } catch (error) {
                    console.error('Error scrolling to row from event:', error);
                }

                // Clear the ref after execution
                if (scrollTimeoutRef.current) {
                    scrollTimeoutRef.current = null;
                }
            }, 400);
        },
        [scrollContainerRef],
    );

    // Cleanup resources on unmount
    useEffect(() => {
        return () => {
            // Clear any pending timeouts
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = null;
            }
        };
    }, []);

    // Handle expanded state change.
    const handleExpandedChange = useCallback(
        (updaterOrValue: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => {
            // Define the core logic for calculating the next state based on the previous state
            const calculateFinalState = (prevState: ExpandedState): ExpandedState => {
                const potentialNewState =
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState)
                        : updaterOrValue;

                // Apply exclusive logic ONLY if enableExclusiveRowExpansion is true
                if (enableExclusiveRowExpansion) {
                    const expandedIds = Object.keys(potentialNewState).filter(
                        (id) => potentialNewState[id as keyof ExpandedState],
                    );

                    if (expandedIds.length > 1) {
                        // More than one row would be expanded. Find the one that was newly added compared to the prevState.
                        const previouslyExpandedIds = Object.keys(prevState).filter(
                            (id) => prevState[id as keyof ExpandedState],
                        );
                        const newlySetTrueIds = expandedIds.filter(
                            (id) => !previouslyExpandedIds.includes(id),
                        );

                        if (newlySetTrueIds.length === 1) {
                            // A single new row was expanded, make it exclusive
                            const exclusiveState: ExpandedState = {};
                            exclusiveState[newlySetTrueIds[0] as keyof ExpandedState] = true;
                            return exclusiveState;
                        } else {
                            // Edge case: Multiple rows added simultaneously or only collapse/no change with multiple rows remaining.
                            // Use the "last key" approach as a fallback for consistency.
                            const lastExpandedRow = expandedIds[expandedIds.length - 1];
                            const exclusiveState: ExpandedState = {};
                            exclusiveState[lastExpandedRow as keyof ExpandedState] = true;
                            return exclusiveState;
                        }
                    }
                    // If 0 or 1 row is expanded (or became expanded), fall through to return potentialNewState
                }

                // Call the external handler with the calculated final state
                if (onExpandedChange) {
                    onExpandedChange(potentialNewState);
                }

                return potentialNewState;
            };

            // Update the internal state using the same logic
            setExpandedState((prevInternalState) => calculateFinalState(prevInternalState));
        },
        [onExpandedChange, enableExclusiveRowExpansion],
    );

    return {
        expandedState,
        handleExpandedChange,
        scrollToRowById,
        scrollToRowByEvent,
    };
};
