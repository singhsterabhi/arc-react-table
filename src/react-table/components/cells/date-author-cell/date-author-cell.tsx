import React from 'react';
import classNames from 'classnames';
import { RowData } from '@tanstack/table-core';
import './date-author-cell.less';
import { BaseCellProps } from '../../../types';
import { DateCell } from '../date-cell/date-cell';
import { AuthorCell } from '../author-cell/author-cell';

export interface DateAuthorCellProps<TData extends RowData = any, TValue = any>
    extends BaseCellProps<TData, TValue> {
    date?: string | Date;
    author?: string;
    dateFormat?: string;
    extractUsername?: boolean;
    forceAuthorNewLine?: boolean;
}

/**
 * A reusable component for displaying date and author information in table cells
 */
function DateAuthorCellComponent<TData extends RowData = any, TValue = any>(
    props: DateAuthorCellProps<TData, TValue>,
) {
    const {
        date,
        author,
        dateFormat = 'MMM DD YYYY, HH:mm',
        extractUsername = true,
        className,
        style,
        forceAuthorNewLine = false,
        ...restProps
    } = props;

    return (
        <div className={classNames('date-author-cell__container', className)} style={style}>
            <DateCell<TData, TValue> date={date} dateFormat={dateFormat} {...restProps} />
            {author && (
                <>
                    {forceAuthorNewLine && <br />}
                    <AuthorCell<TData, TValue>
                        author={author}
                        extractUsername={extractUsername}
                        prefix='by'
                        {...restProps}
                    />
                </>
            )}
        </div>
    );
}

export const DateAuthorCell = React.memo(DateAuthorCellComponent) as <
    TData extends RowData = any,
    TValue = any,
>(
    props: DateAuthorCellProps<TData, TValue>,
) => React.JSX.Element;
