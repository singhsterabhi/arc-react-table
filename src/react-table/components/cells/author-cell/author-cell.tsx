import React, { useMemo } from 'react';
import Typography from 'antd/es/typography';
import classNames from 'classnames';
import { RowData } from '@tanstack/table-core';
import './author-cell.less';
import { BaseCellProps } from '../../../types';
import { EntityCell } from '../entity-cell/entity-cell';

export interface AuthorCellProps<TData extends RowData = any, TValue = any>
    extends BaseCellProps<TData, TValue> {
    author?: string;
    extractUsername?: boolean;
    prefix?: string;
}

/**
 * A reusable component for displaying author information in table cells
 */
function AuthorCellComponent<TData extends RowData = any, TValue = any>(
    props: AuthorCellProps<TData, TValue>,
) {
    const { author, extractUsername = true, prefix, style, className, ...rest } = props;

    // Extract username from email if needed
    const displayName = useMemo(() => {
        let name = author || '';
        if (extractUsername && name.includes('@')) {
            name = name.split('@')[0];
        }
        return name;
    }, [author, extractUsername]);

    if (!displayName) {
        return null;
    }

    return (
        <div className={classNames('author-cell__container', className)} style={style}>
            <Typography.Text className='author-cell__author'>
                {prefix}
                <EntityCell value={displayName} {...(rest as any)} />
            </Typography.Text>
        </div>
    );
}

export const AuthorCell = React.memo(AuthorCellComponent) as <
    TData extends RowData = any,
    TValue = any,
>(
    props: AuthorCellProps<TData, TValue>,
) => React.JSX.Element;
