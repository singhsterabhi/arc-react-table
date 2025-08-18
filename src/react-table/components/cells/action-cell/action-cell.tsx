import React, { useCallback } from 'react';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Tooltip from 'antd/es/tooltip';
import classNames from 'classnames';
import './action-cell.less';
import { Cell, RowData, Table } from '@tanstack/table-core';
import { BaseCellProps } from '../../../types';

type CustomRowData<TData extends RowData> = Record<string, any> | TData;
export interface ActionItem<TData extends RowData> {
    key: string;
    icon?: React.ReactNode;
    label?: string;
    title?: string;
    description?: string;
    type?: 'default' | 'link' | 'text' | 'primary' | 'dashed';
    size?: 'small' | 'middle' | 'large';
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent, rowData: CustomRowData<TData>) => void;
    disabled?: boolean;
    danger?: boolean;
    className?: string;
    rounded?: boolean;
    render?: () => React.ReactNode;
}

export interface ActionCellProps<TData extends RowData, TValue>
    extends BaseCellProps<TData, TValue> {
    actions: ActionItem<CustomRowData<TData>>[];
    rowData?: CustomRowData<TData>;
}

/**
 * A generic reusable component for displaying action buttons in table cells
 */
const ActionCellComponent = <TData extends RowData, TValue>(
    props: ActionCellProps<TData, TValue>,
) => {
    const { cell, actions = [], className, style, rowData: rowDataProp, table } = props;

    return (
        <Space className={classNames('action-cell__container', className)} style={style}>
            {actions.map((action, index) => {
                const { key, render } = action;

                // If render function is provided, use that instead of Button
                if (render) {
                    return <span key={key}>{render()}</span>;
                }

                return (
                    <ActionCellButton
                        key={key + index}
                        action={action}
                        table={table}
                        cell={cell}
                        rowDataProp={rowDataProp}
                    />
                );
            })}
        </Space>
    );
};

const styles = {
    body: {
        maxWidth: '400px',
        whiteSpace: 'normal',
    },
};

export const ActionCellButton = <TData extends RowData, TValue>({
    action,
    table,
    cell,
    rowDataProp,
}: {
    action: ActionItem<CustomRowData<TData>>;
    table?: Table<TData>;
    cell?: Cell<TData, TValue>;
    rowDataProp?: CustomRowData<TData> | undefined;
}) => {
    const {
        rounded = true,
        key,
        description,
        title,
        type,
        size,
        icon,
        style,
        disabled,
        danger,
        className,
        label,
        onClick,
    } = action;

    // Create event handlers map outside of render to prevent recreation on each render
    const handleActionClick = useCallback(
        (actionOnClick?: (e: React.MouseEvent, data: CustomRowData<TData>) => void) =>
            (e: React.MouseEvent) => {
                e.stopPropagation();
                actionOnClick?.(e, (rowDataProp ?? cell?.row.original) as CustomRowData<TData>);
            },
        [rowDataProp, cell],
    );

    const handleActionContextMenu = useCallback(
        (actionOnContextMenu?: (e: React.MouseEvent, data: CustomRowData<TData>) => void) =>
            (e: React.MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                actionOnContextMenu?.(
                    e,
                    (rowDataProp ?? cell?.row.original) as CustomRowData<TData>,
                );
            },
        [rowDataProp, cell],
    );

    return (
        <Tooltip
            key={key}
            title={description || title}
            placement='top'
            getPopupContainer={table?.options.meta?.getMaskedPopupContainer}
            autoAdjustOverflow={true}
            destroyOnHidden={true}
            styles={styles}
        >
            <Button
                type={type || 'default'}
                size={size || 'small'}
                icon={icon}
                style={style}
                onClick={onClick ? handleActionClick(onClick) : undefined}
                disabled={disabled}
                onContextMenu={onClick && !disabled ? handleActionContextMenu(onClick) : undefined}
                danger={danger}
                className={classNames(className, 'action-cell__button', {
                    'action-cell__button--rounded': rounded,
                })}
            >
                {label}
            </Button>
        </Tooltip>
    );
};

// Only use memo where the component props are likely to remain stable between renders
export const ActionCell = React.memo(ActionCellComponent) as <TData extends RowData, TValue>(
    props: ActionCellProps<TData, TValue>,
) => React.JSX.Element;
