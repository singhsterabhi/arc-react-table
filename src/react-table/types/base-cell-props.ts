import { CellContext, HeaderContext, RowData } from '@tanstack/react-table';
import React from 'react';

export interface BaseCellProps<TData extends RowData, TValue> extends CellContext<TData, TValue> {
    className?: string;
    style?: React.CSSProperties;
}

export interface BaseHeaderProps<TData extends RowData, TValue>
    extends HeaderContext<TData, TValue> {
    className?: string;
    style?: React.CSSProperties;
}
