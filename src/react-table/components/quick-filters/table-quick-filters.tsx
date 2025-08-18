import React, { useMemo } from 'react';
import { Table } from '@tanstack/react-table';
import QuickFilters from './quick-filters';
import { toTitleCase } from '../../utils';

interface TableQuickFiltersProps {
    table: Table<any>;
    quickFilterColumns: string[];
}

const quickFilterTextStyle = {
    whiteSpace: 'nowrap',
    fontWeight: 'bold',
    paddingTop: '3px',
};

// Constant defined outside component to prevent recreation
const MULTI_SELECT = true;

/**
 * Component to manage quick filters for multiple status columns
 */
const TableQuickFilters: React.FC<TableQuickFiltersProps> = ({ table, quickFilterColumns }) => {
    // Extract only needed table state to use as dependencies
    const columnFilters = table.getState().columnFilters;
    const globalFilter = table.getState().globalFilter;
    const rows = table.getPreFilteredRowModel().rows;

    const filteredColumnsValues = useMemo(() => {
        return quickFilterColumns
            .map((col) => {
                const column = table.getColumn(col);
                if (!column || !column.columnDef.id) {
                    return null;
                }
                const options = column.columnDef.meta?.quickFilterOptions || [];
                const uniqueValues = column.getFacetedUniqueValues?.() || [];

                let filterOptions =
                    uniqueValues?.size > 0
                        ? (() => {
                              // First, create individual filter options
                              const individualOptions = Array.from(uniqueValues?.entries())
                                  .filter(
                                      ([value, count]) =>
                                          value !== null && value !== undefined && count > 0,
                                  )
                                  .map(([value, count]) => ({
                                      value,
                                      count,
                                      label:
                                          options.find(
                                              (opt: { value: any; label: string }) =>
                                                  opt.value === value,
                                          )?.label || toTitleCase(value),
                                  }));

                              // Group by label and combine values with same labels
                              const groupedByLabel = individualOptions.reduce(
                                  (acc, option) => {
                                      const existingGroup = acc.find(
                                          (group) => group.label === option.label,
                                      );
                                      if (existingGroup) {
                                          // Combine values and counts for same label
                                          existingGroup.value = Array.isArray(existingGroup.value)
                                              ? [...existingGroup.value, option.value]
                                              : [existingGroup.value, option.value];
                                          existingGroup.count += option.count;
                                      } else {
                                          acc.push({
                                              value: option.value,
                                              count: option.count,
                                              label: option.label,
                                          });
                                      }
                                      return acc;
                                  },
                                  [] as Array<{ value: any; count: number; label: string }>,
                              );

                              return groupedByLabel.sort((a, b) => b.count - a.count);
                          })()
                        : [];
                return {
                    id: column.columnDef.id as string,
                    title: column.columnDef.header as string,
                    filterOptions,
                };
            })
            .filter(Boolean);
    }, [quickFilterColumns, columnFilters, globalFilter, rows]);

    // If we have no columns, don't render
    if (filteredColumnsValues.length === 0) {
        return null;
    }

    return (
        <div className='react-table-quick-filters'>
            {filteredColumnsValues?.map((col) => {
                if (col?.filterOptions.length === 0) {
                    return null;
                }

                return (
                    <div key={col?.id} className='react-table-quick-filter'>
                        <div
                            className='react-table-quick-filter-title'
                            style={quickFilterTextStyle}
                        >
                            {col?.title}
                        </div>
                        <QuickFilters
                            columnId={col?.id as string}
                            options={col?.filterOptions}
                            multiSelect={MULTI_SELECT}
                            table={table}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default TableQuickFilters;
