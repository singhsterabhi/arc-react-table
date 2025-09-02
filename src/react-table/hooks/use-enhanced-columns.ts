import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import React from 'react';
import { CheckboxHeader, CheckboxCell, ExpandRowCell, ExpandAllHeader } from '../components/cells';
import { SearchFilter } from '../components/column-filters';
import { ColumnConfig } from '../types/types';

const columnHelper = createColumnHelper<any>();

export const useEnhancedColumns = ({
    columns,
    enableRowSelection,
    enableExpanding,
    enableExpandAll,
    renderDetailPanel,
    expandRowTitle,
    enableColumnFilters,
}: {
    columns: ColumnConfig[];
    enableRowSelection: boolean;
    enableExpanding: boolean;
    enableExpandAll: boolean;
    renderDetailPanel: any;
    expandRowTitle: string;
    enableColumnFilters: boolean;
}) => {
    // Enhance columns with selection and expansion columns if needed
    const enhancedColumns: ColumnDef<any>[] = useMemo(() => {
        const enhancedCols: ColumnDef<any>[] = columns.map((col) => {
            const { id, accessorFn, ...restConfig } = col;
            const columnFilterEnabled =
                enableColumnFilters && (restConfig.enableColumnFilter ?? true);
            const filterFn = columnFilterEnabled
                ? restConfig.filterFn
                    ? restConfig.filterFn
                    : SearchFilter().filterFn
                : undefined;
            const Filter = columnFilterEnabled
                ? restConfig.meta?.Filter
                    ? restConfig.meta?.Filter
                    : SearchFilter().Filter
                : undefined;

            return columnHelper.accessor(accessorFn ?? id ?? '', {
                id: id ?? '',
                ...restConfig,
                filterFn,
                meta: {
                    ...restConfig.meta,
                    Filter,
                },
            });
        });

        // Add row selection column if enabled
        if (enableRowSelection) {
            enhancedCols.unshift(
                columnHelper.display({
                    id: 'react-table-row-select',
                    header: CheckboxHeader,
                    cell: CheckboxCell,
                    size: 40,
                    enableSorting: false,
                    meta: {
                        showHeaderActionItems: false,
                        enableCellContextMenu: false,
                    },
                }),
            );
        }

        // Add row expansion column if enabled or if detail panel is provided
        // Conditionally render ExpandAllHeader if enableExpandAll is true
        if (enableExpanding || renderDetailPanel) {
            enhancedCols.unshift(
                columnHelper.display({
                    id: 'react-table-row-expand',
                    header: enableExpandAll ? ExpandAllHeader : () => null, // Conditional header
                    cell: (props: any) =>
                        React.createElement(ExpandRowCell, {
                            ...props,
                            title: expandRowTitle,
                        }),
                    size: 40,
                    enableSorting: false,
                    meta: {
                        showHeaderActionItems: false,
                        enableCellContextMenu: false,
                    },
                }),
            );
        }

        return enhancedCols;
    }, [
        columns,
        enableRowSelection,
        enableExpanding,
        renderDetailPanel,
        enableExpandAll,
        expandRowTitle,
        enableColumnFilters,
    ]);

    return enhancedColumns;
};
