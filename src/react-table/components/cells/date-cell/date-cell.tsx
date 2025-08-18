import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { RowData } from '@tanstack/table-core';
import './date-cell.less';
import { BaseCellProps } from '../../../types';
import { EntityCell } from '../entity-cell/entity-cell';

export interface DateCellProps<TData extends RowData = any, TValue = any>
    extends BaseCellProps<TData, TValue> {
    date?: string | Date;
    dateFormat?: string;
}

/**
 * A reusable component for displaying date information in table cells
 */
function DateCellComponent<TData extends RowData = any, TValue = any>(
    props: DateCellProps<TData, TValue>,
) {
    const { date, dateFormat = 'MMM DD YYYY, HH:mm', className, style, ...rest } = props;

    // Format the date if provided
    const formattedDate = useMemo(() => {
        return date ? dayjs(date).format(dateFormat) : '';
    }, [date, dateFormat]);

    return (
        <div className={classNames('date-cell__container', className)} style={style}>
            <div className='date-cell__date'>
                <EntityCell value={formattedDate} {...(rest as any)} />
            </div>
        </div>
    );
}

export const DateCell = React.memo(DateCellComponent) as <
    TData extends RowData = any,
    TValue = any,
>(
    props: DateCellProps<TData, TValue>,
) => React.JSX.Element;
