import React, { useMemo, CSSProperties, useCallback } from 'react';
import { getCustomRendererColSpan, getRowBackgroundColor } from '../utils';
import { DetailPanelRow } from './detail-panel-row';
import { RowElement } from './row-element';
import { Row, Table } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/react-table';
import classNames from 'classnames';
import { RenderDetailPanelProps, GetRowPollingConfig, UpdateRowData } from '../../types';
import { useRowPolling } from '../../hooks/use-row-polling';

interface TableRowsProps {
    table: Table<any>;
    row: Row<any>;
    rowIndex: number;
    measureElement?: (el: HTMLTableRowElement | null) => void;
    columns: ColumnDef<any>[];
    cellRenderers?: Record<string, (props: any) => React.ReactNode>;
    renderDetailPanel?: (props: RenderDetailPanelProps) => React.ReactNode;
    addExtraColumn?: boolean;
    virtualRow: any;
    isVirtualRow: boolean;
    enableRowPolling?: boolean;
    defaultPollingInterval?: number;
    getRowPollingConfig?: GetRowPollingConfig;
    updateRowData?: UpdateRowData;
    enableTablePolling?: boolean;
    defaultTablePollingInterval?: number;
}

const defaultVirtualRow = { size: 40 };

export const TableRow = ({
    table,
    row,
    rowIndex,
    measureElement,
    columns,
    cellRenderers,
    renderDetailPanel,
    addExtraColumn,
    virtualRow,
    isVirtualRow,
    enableRowPolling,
    defaultPollingInterval,
    getRowPollingConfig,
    updateRowData,
    enableTablePolling,
}: TableRowsProps) => {
    if (!row) {
        return null;
    }

    // Get polling configuration for this row
    const pollingConfig = useMemo(() => {
        if (enableRowPolling && getRowPollingConfig) {
            // Row polling: use getRowPollingConfig
            return getRowPollingConfig(row);
        }
        return null;
    }, [enableRowPolling, getRowPollingConfig, row]);

    // Get shouldPoll for table polling
    const shouldPollForTable = useMemo(() => {
        if (enableTablePolling && table?.options.meta?.tablePolling) {
            // Get table polling config from the table meta
            const tablePollingConfig = table.options.meta.tablePollingConfig;
            if (tablePollingConfig?.shouldPollRow) {
                return tablePollingConfig.shouldPollRow(row);
            }
        }
        return false;
    }, [enableTablePolling, table, row.id, row.index, row.original]);

    // Initialize row polling (only if table polling is not enabled)
    useRowPolling({
        row,
        pollingConfig: enableTablePolling ? null : pollingConfig,
        defaultInterval: defaultPollingInterval,
        updateRowData,
    });

    // Handle table polling registration
    React.useEffect(() => {
        if (enableTablePolling && table?.options.meta?.tablePolling) {
            const tablePolling = table.options.meta.tablePolling;

            // Add this row to table polling
            tablePolling.addRowToPolling(row, shouldPollForTable);

            // Cleanup when row unmounts
            return () => {
                const rowId = row.id ?? String(row.index);
                tablePolling.removeRowFromPolling(rowId);
            };
        }
    }, [enableTablePolling, table, row.id, row.index, shouldPollForTable]);

    // Update polling state when shouldPoll changes
    React.useEffect(() => {
        if (enableTablePolling && table?.options.meta?.tablePolling) {
            const tablePolling = table.options.meta.tablePolling;
            const rowId = row.id ?? String(row.index);
            tablePolling.updateRowPollingState(rowId, shouldPollForTable);
        }
    }, [enableTablePolling, table, row.id, row.index, shouldPollForTable]);

    const level = row.depth;
    const backgroundColor = getRowBackgroundColor(level);

    const tableRowHeight = table?.options.meta?.rowHeight;
    const virtualRowHeight = virtualRow?.size;

    const rowHeight = useMemo(() => {
        if (isVirtualRow) {
            return virtualRowHeight || tableRowHeight || defaultVirtualRow.size;
        }
        return 'max-content';
    }, [isVirtualRow, virtualRowHeight, tableRowHeight]);

    const style = useMemo(
        (): CSSProperties => ({
            background: backgroundColor,
            height: rowHeight,
            willChange: 'transform',
        }),
        [backgroundColor, rowHeight],
    );

    // Get these values from the row directly in render to ensure we catch state changes
    const isSelected = row.getIsSelected && row.getIsSelected();
    const rowClassName = classNames('row-level-' + level, isSelected ? 'selected-row' : '');

    const hasCustomRender = row.original && row.original.renderType;

    const rowSelectDoubleClick = useCallback(
        (e: React.MouseEvent<HTMLTableRowElement>) => {
            e.stopPropagation();
            row.getToggleSelectedHandler()(e as any);
        },
        [row],
    );

    return (
        <>
            <tr
                id={`row-${row.id}`}
                data-index={rowIndex}
                ref={measureElement}
                className={rowClassName}
                style={style}
                onDoubleClick={rowSelectDoubleClick}
            >
                {hasCustomRender ? (
                    <td
                        className='custom-render'
                        colSpan={getCustomRendererColSpan(columns) + (addExtraColumn ? 1 : 0)}
                    >
                        <div className='cell custom-render-content'>
                            {cellRenderers?.[row.original.renderType]?.({
                                cell: row.original.props,
                                row: row,
                            })}
                        </div>
                    </td>
                ) : (
                    <RowElement
                        virtualRow={virtualRow || defaultVirtualRow}
                        row={row}
                        addExtraColumn={addExtraColumn || false}
                    />
                )}
            </tr>
            {renderDetailPanel ? (
                <DetailPanelRow
                    table={table}
                    row={row}
                    columns={columns}
                    renderDetailPanel={renderDetailPanel}
                    addExtraColumn={addExtraColumn || false}
                />
            ) : null}
        </>
    );
};
