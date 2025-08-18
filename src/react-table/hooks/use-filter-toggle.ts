import { useCallback, useState } from 'react';

export const useFilterToggle = (
    initialColumnFilterToggle: boolean,
    enableColumnFilters: boolean,
) => {
    const [filtersEnabled, setFiltersEnabled] = useState(
        enableColumnFilters && initialColumnFilterToggle,
    );

    // Toggle filters
    const toggleFilters = useCallback(() => {
        setFiltersEnabled((prev) => !prev);
    }, []);

    return {
        filtersEnabled,
        toggleFilters,
    };
};
