import { Table } from '@tanstack/react-table';
import React from 'react';
import './toolbar.less';
import QuickFilterContainer from '../quick-filters/quick-filter-container';
import { ColumnFilterToggleWidget, ColumnWidget, TableDataExport } from './widgets';
import { SelectedRowActionButtonProps, SelectedRowActions } from '../selected-row-actions';

interface TopToolbarProps {
    enableQuickFilters: boolean;
    enableColumnMenu: boolean;
    quickFilterColumns: string[];
    table: Table<any>;
    enableColumnFilters: boolean;
    enableColumnFilterToggle: boolean;
    enableExport?: boolean;
    onExport?: (data: any[]) => void;
    leftToolbarComponent?: React.ReactNode;
    rightToolbarComponent?: React.ReactNode;
    rowSelectionActions?: SelectedRowActionButtonProps[];
    tableTitle?: string | React.ReactNode;
    showToggleAllRowsSelected?: boolean;
    widgetButtonSize?: 'sm' | 'md' | 'lg';
}

const ReactTableTopToolbar: React.FC<TopToolbarProps> = ({
    enableQuickFilters,
    enableColumnMenu,
    quickFilterColumns,
    table,
    enableColumnFilters,
    enableColumnFilterToggle,
    enableExport,
    onExport,
    leftToolbarComponent,
    rightToolbarComponent,
    rowSelectionActions,
    tableTitle,
    showToggleAllRowsSelected = true,
    widgetButtonSize = 'md',
}) => {
    return (
        <div className='react-table-top-toolbar'>
            <div className='react-table-top-toolbar-row react-table-top-toolbar-row-flex'>
                <div className='react-table-top-toolbar-left'>
                    {tableTitle && (
                        <div className='react-table-top-toolbar-title'>{tableTitle}</div>
                    )}
                    {rowSelectionActions && rowSelectionActions.length > 0 && (
                        <SelectedRowActions
                            table={table}
                            rowSelectionActions={rowSelectionActions}
                            showToggleAllRowsSelected={showToggleAllRowsSelected}
                        />
                    )}
                    {leftToolbarComponent}
                    {rightToolbarComponent}
                </div>
                <div className='react-table-top-toolbar-right'>
                    {enableExport && (
                        <TableDataExport
                            table={table}
                            onExport={onExport}
                            widgetButtonSize={widgetButtonSize}
                        />
                    )}
                    {enableColumnFilters && enableColumnFilterToggle && (
                        <ColumnFilterToggleWidget
                            table={table}
                            widgetButtonSize={widgetButtonSize}
                        />
                    )}
                    {enableColumnMenu && (
                        <ColumnWidget table={table} widgetButtonSize={widgetButtonSize} />
                    )}
                </div>
            </div>
            <div className='react-table-top-toolbar-row'>
                {enableQuickFilters &&
                    quickFilterColumns.length > 0 &&
                    !table?.options.meta?.loading && (
                        <QuickFilterContainer
                            table={table}
                            quickFilterColumns={quickFilterColumns}
                        />
                    )}
            </div>
        </div>
    );
};

export default ReactTableTopToolbar;
