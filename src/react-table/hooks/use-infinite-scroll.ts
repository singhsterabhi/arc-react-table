import { useCallback, useEffect, RefObject, useRef, useState, useMemo } from 'react';

interface UseInfiniteScrollResult {
    isInfiniteScrollActive: boolean;
    sentinelRef: RefObject<HTMLDivElement>;
    isLoadingMore: boolean; // Exposed for internal use in ReactTable only
}

/**
 * Hook for implementing infinite scroll functionality using IntersectionObserver
 */
export const useInfiniteScroll = (
    scrollContainerRef: RefObject<HTMLDivElement>,
    loading: boolean, // External loading state from parent
    hasMoreData: boolean,
    onLoadMore: (() => void) | undefined,
    threshold = 80,
    enabled: boolean,
    debounceMs = 200, // Debounce delay in milliseconds
): UseInfiniteScrollResult => {
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const debounceTimeoutRef = useRef<number | null>(null);

    // Clean up function for all timeouts
    const cleanupTimeouts = useCallback(() => {
        if (debounceTimeoutRef.current !== null) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
    }, []);

    // Clean up function for observer
    const cleanupObserver = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
    }, []);

    // Reset loading state when external loading state changes
    useEffect(() => {
        // When external loading changes to false, we've completed a load
        if (loading === false) {
            setIsLoadingMore(false);
        }
    }, [loading]);

    // Create debounced load handler with proper cleanup
    const triggerLoadMore = useCallback(() => {
        // Don't trigger if already loading
        if (loading || isLoadingMore) return;

        // Update our local loading state
        setIsLoadingMore(true);

        // Trigger the load
        if (onLoadMore) onLoadMore();
    }, [onLoadMore, loading, isLoadingMore]);

    const debouncedLoadHandler = useCallback(() => {
        // Clear any existing debounce timeout
        cleanupTimeouts();

        // Set new debounce timeout
        debounceTimeoutRef.current = window.setTimeout(triggerLoadMore, debounceMs);
    }, [triggerLoadMore, debounceMs, cleanupTimeouts]);

    // Memoize the observer options to prevent unnecessary observer recreation
    const observerOptions = useMemo(
        () => ({
            root: scrollContainerRef.current,
            rootMargin: `0px 0px ${threshold}px 0px`,
            threshold: 0.1,
        }),
        [scrollContainerRef, threshold],
    );

    // Intersection observer setup
    useEffect(() => {
        // Skip if necessary refs aren't available or feature is disabled
        if (
            !scrollContainerRef.current ||
            !sentinelRef.current ||
            !enabled ||
            !hasMoreData ||
            !onLoadMore
        ) {
            cleanupObserver();
            return;
        }

        // Clean up any existing observer
        cleanupObserver();

        // Create new observer - use callback ref pattern to avoid stale closures
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            // Get current values from state rather than closures
            const shouldLoadMore =
                entry?.isIntersecting && hasMoreData && enabled && !loading && !isLoadingMore;

            if (shouldLoadMore) {
                debouncedLoadHandler();
            }
        }, observerOptions);

        // Start observing the sentinel
        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
            observerRef.current = observer;
        }

        // Cleanup on unmount or dependency change
        return () => {
            cleanupObserver();
            cleanupTimeouts();
        };
    }, [
        scrollContainerRef,
        sentinelRef,
        enabled,
        hasMoreData,
        onLoadMore,
        loading,
        isLoadingMore,
        debouncedLoadHandler,
        observerOptions,
        cleanupObserver,
        cleanupTimeouts,
    ]);

    // Final cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupObserver();
            cleanupTimeouts();
        };
    }, [cleanupObserver, cleanupTimeouts]);

    // Memoize the return value to prevent unnecessary renders
    return {
        isInfiniteScrollActive: enabled && hasMoreData,
        sentinelRef: sentinelRef as RefObject<HTMLDivElement>,
        isLoadingMore,
    };
};
