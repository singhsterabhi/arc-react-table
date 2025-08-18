import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DateRange, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import React, { useCallback, useMemo, useState } from 'react';
import Popover from 'antd/es/popover';
import Input from 'antd/es/input';
import { Column, FilterFn, Table } from '@tanstack/react-table';
import './date-filter.less';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type DateFilterProps = {
    Filter: (props: { column?: Column<any, any>; table?: Table<any> }) => React.JSX.Element;
    filterFn: FilterFn<any>;
};

export const DateFilter = (): DateFilterProps => {
    return {
        Filter: ({ column }: { column?: Column<any, any>; table?: Table<any> }) => {
            const [dateRange, setDateRange] = useState([
                {
                    startDate: new Date(),
                    endDate: new Date(),
                    key: 'selection',
                },
            ]);
            const [open, setOpen] = useState(false);
            const [hasSelection, setHasSelection] = useState(false);

            const handleOpenChange = useCallback((newOpen: boolean) => {
                setOpen(newOpen);
            }, []);

            // Format the date range in the desired format: "Dec 11 2024 → Mar 10 2025"
            const formattedDateDisplay = useMemo(() => {
                if (!hasSelection || !dateRange[0].startDate || !dateRange[0].endDate) return '';

                const startDate = dayjs(dateRange[0].startDate);
                const endDate = dayjs(dateRange[0].endDate);

                return `${startDate.format('MMM D YYYY')} → ${endDate.format('MMM D YYYY')}`;
            }, [dateRange, hasSelection]);

            const handleDateChange = useCallback(
                (item: RangeKeyDict) => {
                    if (item.selection.startDate && item.selection.endDate) {
                        setHasSelection(true);
                        const newRange = {
                            startDate: item.selection.startDate,
                            endDate: item.selection.endDate,
                            key: item.selection.key || 'selection',
                        };
                        setDateRange([newRange]);
                        column?.setFilterValue([item.selection.startDate, item.selection.endDate]);
                    }
                },
                [column],
            );

            const handleClear = useCallback(() => {
                setDateRange([
                    {
                        startDate: new Date(),
                        endDate: new Date(),
                        key: 'selection',
                    },
                ]);
                setHasSelection(false);
                column?.setFilterValue(null);
            }, [column]);

            const handlePopoverMouseLeave = useCallback(() => setOpen(false), []);

            const content = (
                <div onMouseLeave={handlePopoverMouseLeave}>
                    <DateRange
                        editableDateInputs={true}
                        direction='horizontal'
                        showPreview={false}
                        onChange={handleDateChange}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                        minDate={new Date('2000-01-01')}
                        maxDate={new Date()}
                        showDateDisplay={false}
                        // retainEndDateOnFirstSelection={true}
                    />
                </div>
            );

            return (
                <Popover
                    content={content}
                    trigger='click'
                    open={open}
                    onOpenChange={handleOpenChange}
                    placement='bottom'
                    className='custom-mantine-date-range-filter-popover'
                    classNames={{
                        root: 'custom-mantine-date-range-filter-popover-root',
                        body: 'custom-mantine-date-range-filter-popover-body',
                    }}
                >
                    <Input
                        className='date-range-filter-input'
                        placeholder='Select date range...'
                        size='small'
                        value={formattedDateDisplay}
                        onClear={handleClear}
                        style={{ width: '100%' }}
                        allowClear
                    />
                </Popover>
            );
        },
        filterFn: ((row, columnId, filterValue) => {
            // Check for complete type signature of FilterFn to ensure proper function recognition
            const cellValue = row.getValue(columnId);
            if (!cellValue || !filterValue || !filterValue[0] || !filterValue[1]) {
                return true;
            }
            try {
                // Convert cell value and filter dates to timestamps for comparison
                const cellDate = dayjs(cellValue as string | number | Date).startOf('day');
                const startDate = dayjs(filterValue[0]).startOf('day');
                const endDate = dayjs(filterValue[1]).startOf('day');

                // Check if cell date is within the selected range
                return cellDate.isSameOrAfter(startDate) && cellDate.isSameOrBefore(endDate);
            } catch (e) {
                console.error('Date comparison error:', e);
                return false;
            }
        }) as FilterFn<any>,
    };
};
