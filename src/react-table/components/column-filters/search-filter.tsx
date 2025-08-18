import { useCallback, useRef } from 'react';
import React from 'react';
import Input from 'antd/es/input';
import { InputRef } from 'antd/es/input';
import { Column, FilterFn } from '@tanstack/react-table';
// import debounce from 'lodash/debounce';
import './search-filter.less';

type SearchFilterProps = {
    Filter: (props: { column?: Column<any, any>; table?: any }) => React.JSX.Element;
    filterFn: FilterFn<any>;
};

const style = {
    width: '100%',
};

// Define the actual filter input component
const FilterComponent = ({ column }: { column?: Column<any, any>; table?: any }) => {
    if (!column) return <div />;
    const ref = useRef<InputRef>(null);
    // Debounce the function that updates the column filter
    // const debouncedSetFilter = useCallback(
    //     debounce((value: string | null) => {
    //         column.setFilterValue(value); // Apply the filter to the column
    //     }, 300),
    //     [column.setFilterValue]
    // );

    // Handle changes in the input field
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value ?? '';
            // debouncedSetFilter(newValue || null); // Trigger debounced update
            column.setFilterValue(newValue);
        },
        [column],
    );

    return (
        <Input
            ref={ref}
            key={column.id} // Keep stable key
            placeholder='Search...'
            value={(column.getFilterValue() as string) ?? ''}
            onChange={handleChange}
            size='middle'
            style={style}
            className='custom-mantine-table-search-filter'
            allowClear
        />
    );
};

// Improved filter function for robustness
export const searchFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    const value = row.getValue(columnId);
    // No filter applied if filterValue is null or empty
    if (filterValue == null || filterValue === '') return true;
    // Row value is null, cannot match
    if (value == null) return false;

    const strValue = String(value).toLowerCase();
    const lowerFilterValue = String(filterValue).toLowerCase();
    const filterValues = lowerFilterValue
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f !== '');
    return filterValues.some((f: string) => strValue.includes(f));
};

// This function returns the configuration object
export const SearchFilter = (): SearchFilterProps => {
    return {
        Filter: FilterComponent, // Use the memoized component here
        filterFn: searchFilterFn,
    };
};
