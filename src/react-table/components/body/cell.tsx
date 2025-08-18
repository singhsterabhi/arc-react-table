import { useMemo } from 'react';
import { flexRender } from '@tanstack/react-table';
import { getCommonPinnedClassNames, getCommonPinningStyles, isNullOrUndefined } from '../utils';
import classNames from 'classnames';
import { CellContextMenu } from '../cells';
import { CellContextMenuContext } from '../../types';
interface CellProps {
    cell: any;
    left?: number;
    right?: number;
    isFirstRight?: boolean;
    isLast?: boolean;
    isLastColumnBeforeExtraColumn?: boolean;
}

export const Cell = ({
    cell,
    left,
    right,
    isFirstRight,
    isLast,
    isLastColumnBeforeExtraColumn,
}: CellProps) => {
    const leftStyle = useMemo(() => (isNullOrUndefined(left) ? {} : { left: `${left}px` }), [left]);
    const rightStyle = useMemo(
        () => (isNullOrUndefined(right) ? {} : { right: `${right}px` }),
        [right],
    );

    const calculatedStyle = useMemo(
        () => ({
            ...getCommonPinningStyles(cell.column),
            ...leftStyle,
            ...rightStyle,
            willChange: cell.column.getIsPinned() ? 'transform' : undefined,
        }),
        [cell.column, leftStyle, rightStyle],
    );

    // Don't memoize className to ensure it captures state changes
    const cellClassName = classNames(
        { 'show-shadow-left': isLast, 'show-shadow-right': isFirstRight },
        getCommonPinnedClassNames(cell.column),
        isLastColumnBeforeExtraColumn ? 'last-column-before-extra-column' : '',
    );

    // Don't memoize cell content to ensure it re-renders when value changes
    const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());

    // Get context menu configuration from table meta and column meta
    const tableMeta = cell.getContext().table.options.meta;
    const enableCellContextMenu =
        cell.column.columnDef.meta?.enableCellContextMenu ??
        tableMeta?.enableCellContextMenu ??
        false;
    const enableCopyValue =
        cell.column.columnDef.meta?.enableCopyValue ?? tableMeta?.enableCopyValue ?? true;
    const cellContextMenuActions = tableMeta?.cellContextMenuActions || [];
    const columnContextMenuActions = cell.column.columnDef.meta?.cellContextMenuActions || [];
    // Create context menu context
    const contextMenuContext: CellContextMenuContext = useMemo(
        () => ({
            cell,
            row: cell.row,
            column: cell.column,
            table: cell.getContext().table,
            value: cell.getValue(),
            rowData: cell.row.original,
        }),
        [cell],
    );

    const cellContentWithMenu = enableCellContextMenu ? (
        <CellContextMenu
            context={contextMenuContext}
            actions={cellContextMenuActions}
            columnActions={columnContextMenuActions}
            enableCopyValue={enableCopyValue}
        >
            {cellContent}
        </CellContextMenu>
    ) : (
        cellContent
    );

    return (
        <td scope='col' className={cellClassName} style={calculatedStyle}>
            <div className='cell'>{cellContentWithMenu}</div>
        </td>
    );
};

Cell.displayName = 'Cell';
