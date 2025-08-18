import React, { useCallback, useMemo } from 'react';
import Tag from 'antd/es/tag';
import Space from 'antd/es/space';
import { Table } from '@tanstack/react-table';
import classNames from 'classnames';
import QuickFiltersPopover from './quick-filters-popover';

interface QuickFiltersProps {
    columnId: string;
    options?: { value: string | string[]; label: string; count: number }[];
    multiSelect?: boolean;
    table: Table<any>;
}

/**
 * Component to display quick filter options based on unique values in data
 */
const QuickFilters: React.FC<QuickFiltersProps> = ({
    columnId,
    table,
    options = [],
    multiSelect = false,
}) => {
    let column = table.getColumn(columnId);
    const currentFilterValues = column?.getFilterValue();

    const handleTagClick = useCallback(
        (value: string | string[]) => {
            if (multiSelect) {
                // Extract actual filter values, handling both old and new formats
                let currentValues: string[] = [];
                if (
                    currentFilterValues &&
                    typeof currentFilterValues === 'object' &&
                    '__filter' in currentFilterValues
                ) {
                    // New format with combined object
                    const combinedValue = currentFilterValues as {
                        __display: any;
                        __filter: any;
                    };
                    currentValues = Array.isArray(combinedValue.__filter)
                        ? combinedValue.__filter
                        : [];
                } else if (Array.isArray(currentFilterValues)) {
                    // Old format with just array
                    currentValues = currentFilterValues;
                }

                const valuesToProcess = Array.isArray(value) ? value : [value];

                // Check if all values in the array are already selected
                const allValuesSelected = valuesToProcess.every((v) => currentValues.includes(v));

                let newValues;
                if (allValuesSelected) {
                    // Remove all values from the array
                    newValues = currentValues.filter((v) => !valuesToProcess.includes(v));
                } else {
                    // Add all values that aren't already selected
                    const valuesToAdd = valuesToProcess.filter((v) => !currentValues.includes(v));
                    newValues = [...currentValues, ...valuesToAdd];
                }

                column?.setFilterValue(newValues.length > 0 ? newValues : undefined);
            } else {
                const newValue = currentFilterValues === value ? undefined : value;
                column?.setFilterValue(newValue);
            }
        },
        [column, currentFilterValues, multiSelect],
    );

    const isValueSelected = useCallback(
        (value: string | string[]) => {
            if (multiSelect) {
                // Extract actual filter values, handling both old and new formats
                let currentValues: string[] = [];
                if (
                    currentFilterValues &&
                    typeof currentFilterValues === 'object' &&
                    '__filter' in currentFilterValues
                ) {
                    // New format with combined object
                    const combinedValue = currentFilterValues as {
                        __display: any;
                        __filter: any;
                    };
                    currentValues = Array.isArray(combinedValue.__filter)
                        ? combinedValue.__filter
                        : [];
                } else if (Array.isArray(currentFilterValues)) {
                    // Old format with just array
                    currentValues = currentFilterValues;
                }

                const valuesToCheck = Array.isArray(value) ? value : [value];
                // Return true if all values in the array are selected
                return valuesToCheck.every((v) => currentValues.includes(v));
            }
            return currentFilterValues === value;
        },
        [currentFilterValues, multiSelect],
    );

    const handleAllClick = useCallback(() => {
        column?.setFilterValue(undefined);
    }, [column]);

    const isAllSelected = useMemo(() => {
        if (!currentFilterValues) return true;

        if (multiSelect) {
            // Handle both old and new formats
            if (
                currentFilterValues &&
                typeof currentFilterValues === 'object' &&
                '__filter' in currentFilterValues
            ) {
                // New format with combined object
                const combinedValue = currentFilterValues as {
                    __display: any;
                    __filter: any;
                };
                const filterValues = Array.isArray(combinedValue.__filter)
                    ? combinedValue.__filter
                    : [];
                return filterValues.length === 0;
            } else if (Array.isArray(currentFilterValues)) {
                // Old format with just array
                return currentFilterValues.length === 0;
            }
        }

        return false;
    }, [currentFilterValues, multiSelect]);

    // Determine which tags to display in the main view (first 3)
    const { visibleTags, remainingTags } = useMemo(
        () => ({
            visibleTags: options.slice(0, 3),
            remainingTags: options.length > 3 ? options.slice(3) : [],
        }),
        [options],
    );

    return (
        <Space className='quick-filters-container'>
            <Tag
                key='all'
                onClick={handleAllClick}
                className={classNames('quick-filter-tag', {
                    'quick-filter-tag-selected': isAllSelected,
                })}
            >
                All
            </Tag>

            {/* First 3 tags */}
            {visibleTags.map(({ value, count, label }) => (
                <Tag
                    key={Array.isArray(value) ? value.join('-') : value}
                    onClick={() => handleTagClick(value)}
                    className={classNames('quick-filter-tag', {
                        'quick-filter-tag-selected': isValueSelected(value),
                    })}
                >
                    {label} ({count})
                </Tag>
            ))}

            {/* More tags popover */}
            {remainingTags.length > 0 && (
                <QuickFiltersPopover
                    remainingTags={remainingTags}
                    isValueSelected={isValueSelected}
                    onTagClick={handleTagClick}
                    popupContainer={table.options.meta?.getMaskedPopupContainer}
                />
            )}
        </Space>
    );
};

export default QuickFilters;
