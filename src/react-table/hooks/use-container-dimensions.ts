import {
    useCallback,
    useEffect,
    useMemo,
    RefObject,
    useImperativeHandle,
    MutableRefObject,
} from 'react';
import { debounce } from 'lodash-es';

interface ContainerDimensions {
    width: number;
    height: number;
}
export interface ContainerDimensionsHandle {
    getDimensions: () => ContainerDimensions;
}

export const useContainerDimensions = (
    containerRef: RefObject<HTMLElement | null>,
    setContainerDimensions: ((dimensions: ContainerDimensions) => void) | undefined,
    dimensionsRef: MutableRefObject<ContainerDimensionsHandle | null> | undefined,
    debounceDelay = 100, // Default debounce delay
) => {
    const getCurrentContainerDimensions = useCallback((): ContainerDimensions => {
        if (containerRef.current) {
            return {
                width: containerRef.current.offsetWidth ?? 0,
                height: containerRef.current.offsetHeight ?? 0,
            };
        }
        return { width: 0, height: 0 };
    }, [containerRef]);

    // Expose methods via the ref
    useImperativeHandle(
        dimensionsRef,
        () => ({
            getDimensions: getCurrentContainerDimensions,
        }),
        [getCurrentContainerDimensions],
    );

    // Update height only on resize
    const updateDimensions = useCallback(() => {
        try {
            const dimensions = getCurrentContainerDimensions();
            if (setContainerDimensions) {
                setContainerDimensions(dimensions);
            }
        } catch (error) {
            console.error('Error updating container dimensions:', error);
        }
    }, [getCurrentContainerDimensions, setContainerDimensions]);

    // Debounced function for getting container dimensions
    const debouncedUpdateDimensions = useMemo(
        () => debounce(updateDimensions, debounceDelay),
        [updateDimensions, debounceDelay],
    );

    useEffect(() => {
        // Clean up function to be called on unmount or dependency changes
        const cleanupFunction = () => {
            if (debouncedUpdateDimensions) {
                debouncedUpdateDimensions.cancel();
            }

            // Reset dimensions if container is unmounted
            if (setContainerDimensions) {
                setContainerDimensions({ width: 0, height: 0 });
            }
        };

        const element = containerRef.current;

        // Only run if the element is available
        if (element) {
            try {
                // Define the resize observer callback
                const observerCallback = () => {
                    try {
                        // Only update height internally
                        debouncedUpdateDimensions();
                    } catch (callbackError) {
                        console.error('Error in resize observer callback:', callbackError);
                    }
                };

                // Create and start the resize observer
                const resizeObserver = new ResizeObserver(observerCallback);
                resizeObserver.observe(element);

                // Call once initially to get the starting dimensions for height
                debouncedUpdateDimensions();

                // Cleanup function to disconnect the observer and cancel any pending debounced calls
                return () => {
                    try {
                        resizeObserver.disconnect();
                        cleanupFunction();
                    } catch (cleanupError) {
                        console.error('Error during cleanup:', cleanupError);
                    }
                };
            } catch (observerError) {
                console.error('Error setting up ResizeObserver:', observerError);
                return cleanupFunction;
            }
        }

        // If conditions aren't met, ensure any pending debounced calls are cancelled
        return cleanupFunction;
    }, [containerRef, debouncedUpdateDimensions, setContainerDimensions]);
};
