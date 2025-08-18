import classNames from 'classnames';
import { useCallback, MouseEvent } from 'react';
import './expand-row-cell.less';
import RightArrow from '../../../assets/icons/right-arrow.svg?react';
import { RowData } from '@tanstack/table-core';
import { BaseCellProps } from '../../../types';

interface ExpandRowCellProps<TData extends RowData, TValue> extends BaseCellProps<TData, TValue> {
    title?: string;
}

export const ExpandRowCell = <TData extends RowData, TValue>({
    row,
    title,
}: ExpandRowCellProps<TData, TValue>) => {
    if (!row.getCanExpand()) return null;

    // const scrollToRowById = table?.options.meta?.scrollToRowById;
    // const scrollToRowByEvent = table?.options.meta?.scrollToRowByEvent;
    const rowId = row.id;
    const isExpanded = row.getIsExpanded();
    const isExpandedHandler = row.getToggleExpandedHandler();

    const handleClick = useCallback(
        (_: MouseEvent<HTMLElement>) => {
            // scrollToRowByEvent?.(event);
            isExpandedHandler();
        },
        [rowId, isExpandedHandler],
    );

    return (
        <div onClick={handleClick} className='react-table-expand-cell' title={title}>
            <RightArrow
                className={classNames(
                    'react-table-expand-icon',
                    isExpanded ? 'expanded' : 'collapsed',
                )}
            />
        </div>
    );
};
