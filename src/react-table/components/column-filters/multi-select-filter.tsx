import Select from 'antd/es/select';
import { useCallback, useMemo, useState } from 'react';
// import { uniqBy } from 'lodash'; // Keep lodash removed
import { Column, FilterFn, Table } from '@tanstack/react-table';
import './multi-select-filter.less';
// import { toTitleCase } from '../../../../utils/utils';
import React from 'react';
import { toTitleCase } from '../../utils';

// Define interface for filter options
interface FilterOption {
    value: string | boolean; // Keep original value type
    label?: string;
    [key: string]: any;
}

type MultiSelectFilterProps = {
    Filter: (props: { column?: Column<any, any>; table?: Table<any> }) => React.JSX.Element;
    filterFn: FilterFn<any>;
};

const style = {
    width: '100%',
};

const dropdownAlign = {
    offset: [0, 0],
};

const classNames = {
    popup: {
        root: 'multi-select-filter-popup',
    },
};

export const MultiSelectFilter = (
    options?: FilterOption[],
    isMulti = true,
): MultiSelectFilterProps => {
    return {
        // filterVariant: isMulti ? 'multi-select' : 'select',
        Filter: ({ column, table }: { column?: Column<any, any>; table?: Table<any> }) => {
            // Add state to control dropdown visibility
            const [isOpen, setIsOpen] = useState(false);

            const handleChange = useCallback(
                (values: any) => {
                    // Store the selected display values (for Select component)
                    const displayValues = values;

                    // Process values and expand group identifiers for filtering
                    let filterValues = values;
                    const labelValueMap = (handleChange as any).__labelValueMap || new Map();

                    if (Array.isArray(values)) {
                        filterValues = values.reduce((acc: string[], val: any) => {
                            // Check if this is a group identifier
                            if (
                                typeof val === 'string' &&
                                val.startsWith('__group_') &&
                                labelValueMap.has(val)
                            ) {
                                // Expand the group to its constituent values
                                acc.push(...labelValueMap.get(val));
                            } else if (Array.isArray(val)) {
                                acc.push(...val);
                            } else {
                                acc.push(val);
                            }
                            return acc;
                        }, []);

                        // Remove duplicates that might occur from flattening
                        filterValues = [...new Set(filterValues)];
                    } else if (
                        typeof filterValues === 'string' &&
                        filterValues.startsWith('__group_') &&
                        labelValueMap.has(filterValues)
                    ) {
                        // Handle single group selection
                        filterValues = labelValueMap.get(filterValues);
                    }

                    // Store both display and filter values in the column's filter value
                    // We'll use a special object to distinguish between them
                    const combinedValue = {
                        __display: displayValues,
                        __filter: filterValues,
                    };

                    column?.setFilterValue(
                        Array.isArray(displayValues) && !displayValues.length
                            ? null
                            : combinedValue,
                    );
                },
                [column],
            );

            // Process current value based on mode
            const currentValue = column?.getFilterValue();
            let processedValue;

            if (currentValue && typeof currentValue === 'object' && '__display' in currentValue) {
                // Use display values for the Select component
                const combinedValue = currentValue as { __display: any; __filter: any };
                processedValue = isMulti ? combinedValue.__display || [] : combinedValue.__display;
            } else {
                // Fallback: try to convert old format to new format
                if (currentValue && Array.isArray(currentValue)) {
                    // This is an old filter value, try to reverse-map it to group identifiers
                    processedValue = currentValue; // For now, use as-is but we'll fix this below
                } else {
                    processedValue = isMulti ? currentValue || [] : currentValue;
                }
            }

            // Get unique values from the column data
            const uniqueValuesMap = column?.getFacetedUniqueValues();
            const uniqueValues = Array.from(uniqueValuesMap?.keys() || []);

            // Process unique values into options, handle booleans, map labels if options provided, and sort
            const processedOptions = useMemo(() => {
                // Create a label map from the optional options prop for quick lookup
                const labelMap = new Map<string | boolean, string>();
                if (options) {
                    options.forEach((option) => {
                        if (option.label !== undefined) {
                            labelMap.set(option.value, option.label);
                        }
                    });
                }

                // First, create individual options
                const individualOptions = uniqueValues.map((value) => {
                    let displayValue: string; // Use string for Select value consistency
                    let label: string;
                    const originalValue = value; // Keep track of the original value for lookup

                    // Determine the value to be used in the Select component (handles boolean)
                    if (originalValue === false) {
                        displayValue = 'disabled';
                    } else if (originalValue === true) {
                        displayValue = 'enabled';
                    } else {
                        displayValue = String(originalValue);
                    }

                    // Determine the label: use provided options map first, then defaults
                    const mappedLabel = labelMap.get(originalValue);
                    if (mappedLabel !== undefined) {
                        label = mappedLabel;
                    } else if (originalValue === false) {
                        label = 'Disabled';
                    } else if (originalValue === true) {
                        label = 'Enabled';
                    } else {
                        label = toTitleCase(String(originalValue));
                    }

                    return {
                        value: displayValue, // This is what Select uses internally and what filterFn receives
                        label: label, // This is what the user sees
                    };
                });

                // Group by label and combine values with same labels
                const labelValueMap = new Map<string, string[]>();
                const labelGroups = new Map<string, { value: string; label: string }>();

                // First pass: collect all options by label
                individualOptions.forEach((option) => {
                    if (labelGroups.has(option.label)) {
                        // This label already exists, add to the group
                        const groupId = `__group_${option.label.replace(/\s+/g, '_').toLowerCase()}__`;
                        const existingGroup = labelGroups.get(option.label)!;

                        if (!labelValueMap.has(groupId)) {
                            // First duplicate found, create the group
                            labelValueMap.set(groupId, [existingGroup.value, option.value]);
                            existingGroup.value = groupId; // Update the existing option to use group ID
                        } else {
                            // Add to existing group
                            labelValueMap.get(groupId)!.push(option.value);
                        }
                    } else {
                        // First occurrence of this label
                        labelGroups.set(option.label, {
                            value: option.value,
                            label: option.label,
                        });
                    }
                });

                // Second pass: create the final grouped options array
                const groupedByLabel = Array.from(labelGroups.values());

                // Store the mapping for use in handleChange
                (handleChange as any).__labelValueMap = labelValueMap;

                // Sort options alphabetically by label
                groupedByLabel.sort((a, b) => a.label.localeCompare(b.label));

                return groupedByLabel;
            }, [uniqueValues, options]); // Depend on uniqueValues and the optional options prop

            // Convert old format filter values to display values after options are processed
            if (currentValue && Array.isArray(currentValue) && !(currentValue as any).__display) {
                const labelValueMap = (handleChange as any).__labelValueMap || new Map();
                if (labelValueMap.size > 0) {
                    // Convert old format to display format
                    const displayValues: string[] = [];
                    const remainingValues = [...currentValue];

                    // Check each group to see if all its values are selected
                    for (const [groupId, groupValues] of labelValueMap.entries()) {
                        const allGroupValuesSelected = groupValues.every((val: string) =>
                            remainingValues.includes(val),
                        );
                        if (allGroupValuesSelected) {
                            displayValues.push(groupId);
                            // Remove these values from remaining
                            groupValues.forEach((val: string) => {
                                const index = remainingValues.indexOf(val);
                                if (index > -1) remainingValues.splice(index, 1);
                            });
                        }
                    }

                    // Add any remaining individual values
                    displayValues.push(...remainingValues);

                    processedValue = displayValues;
                }
            }

            const onOpenChange = useCallback((visible: boolean) => {
                setIsOpen(visible);
            }, []);

            const onMouseLeave = useCallback(() => {
                setIsOpen(false);
            }, []);

            const maxTagPlaceholder = useMemo(() => {
                return isMulti
                    ? (omittedValues: any[]) => {
                          const count = omittedValues.length;
                          return <div className='custom-tag-count'>{count} selected</div>;
                      }
                    : undefined;
            }, [isMulti]);

            return (
                <Select
                    mode={isMulti ? 'multiple' : undefined}
                    allowClear
                    style={style}
                    classNames={classNames}
                    placeholder='Select...'
                    onChange={handleChange}
                    options={processedOptions}
                    maxTagCount={0}
                    size='small'
                    value={processedValue}
                    className='inline-filter-multiselect'
                    showSearch={false}
                    open={isOpen}
                    onOpenChange={onOpenChange}
                    onMouseLeave={onMouseLeave}
                    maxTagPlaceholder={maxTagPlaceholder}
                    dropdownAlign={dropdownAlign}
                    getPopupContainer={table?.options.meta?.getMaskedPopupContainer}
                />
            );
        },
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue(columnId);

            // If no filter value is set, show all rows
            if (
                filterValue === undefined ||
                filterValue === null ||
                (Array.isArray(filterValue) && filterValue.length === 0)
            )
                return true;

            // Extract actual filter values from combined value object
            let actualFilterValue = filterValue;
            if (filterValue && typeof filterValue === 'object' && '__filter' in filterValue) {
                const combinedValue = filterValue as { __display: any; __filter: any };
                actualFilterValue = combinedValue.__filter;
            }

            // Flatten filter values in case they contain arrays (from grouped options)
            const flattenFilterValues = (values: any): string[] => {
                if (!Array.isArray(values)) return [values];

                return values.reduce((acc, val) => {
                    if (Array.isArray(val)) {
                        // Recursively flatten nested arrays
                        acc.push(...flattenFilterValues(val));
                    } else {
                        acc.push(val);
                    }
                    return acc;
                }, []);
            };

            const flatFilterValues = flattenFilterValues(actualFilterValue);

            // Helper function to check if a value matches any filter value
            const matchesFilter = (value: any, filterVals: string[]) => {
                return filterVals.some((fv) => {
                    // Handle boolean conversions
                    if (value === false && fv === 'disabled') return true;
                    if (value === true && fv === 'enabled') return true;
                    // Direct comparison
                    return value === fv;
                });
            };

            // Handle array cell values (cell contains multiple values)
            if (Array.isArray(cellValue)) {
                return cellValue.some((value) => matchesFilter(value, flatFilterValues));
            }

            // Handle single cell values
            return matchesFilter(cellValue, flatFilterValues);
        },
    };
};
