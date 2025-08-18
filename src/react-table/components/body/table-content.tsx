import React from 'react';
import { ColumnDef, Table } from '@tanstack/react-table';
import { ColGroup } from '../colgroup/colgroup';
import { TableRow } from './table-row';
import { RenderDetailPanelProps, GetRowPollingConfig, UpdateRowData } from '../../types';
interface TableContentProps {
    table: Table<any>;
    columns: ColumnDef<any>[];
    cellRenderers?: Record<string, (props: any) => React.ReactNode>;
    renderDetailPanel?: (props: RenderDetailPanelProps) => React.ReactNode;
    virtualRows?: any[];
    measureElement?: (el: HTMLTableRowElement | null) => void;
    addExtraColumn?: boolean;
    enableRowPolling?: boolean;
    defaultPollingInterval?: number;
    getRowPollingConfig?: GetRowPollingConfig;
    updateRowData?: UpdateRowData;
    enableTablePolling?: boolean;
    defaultTablePollingInterval?: number;
}

export const TableContent = ({
    table,
    columns,
    cellRenderers,
    renderDetailPanel,
    virtualRows,
    measureElement,
    addExtraColumn,
    enableRowPolling,
    defaultPollingInterval,
    getRowPollingConfig,
    updateRowData,
    enableTablePolling,
    defaultTablePollingInterval,
}: TableContentProps) => {
    const { rows } = table.getRowModel();

    return (
        <table className='react-table-table'>
            <ColGroup table={table} addExtraColumn={addExtraColumn} />
            <tbody>
                {(virtualRows || rows).map((virtualRow, index) => {
                    const row = virtualRows ? rows[virtualRow.index] : rows[index];
                    const rowIndex = virtualRows ? virtualRow.index : index;
                    const isVirtualRow = !!virtualRows;

                    if (!row) return null;

                    return (
                        <TableRow
                            key={row.id}
                            row={row}
                            table={table}
                            rowIndex={rowIndex}
                            measureElement={measureElement}
                            columns={columns}
                            cellRenderers={cellRenderers}
                            renderDetailPanel={renderDetailPanel}
                            addExtraColumn={addExtraColumn}
                            virtualRow={virtualRow}
                            isVirtualRow={isVirtualRow}
                            enableRowPolling={enableRowPolling}
                            defaultPollingInterval={defaultPollingInterval}
                            getRowPollingConfig={getRowPollingConfig}
                            updateRowData={updateRowData}
                            enableTablePolling={enableTablePolling}
                            defaultTablePollingInterval={defaultTablePollingInterval}
                        />
                    );
                })}
            </tbody>
        </table>
    );
};

TableContent.displayName = 'TableContent';
