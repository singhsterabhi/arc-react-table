import React, { useMemo } from 'react';
import Badge from 'antd/es/badge';
import { BadgeProps } from 'antd/es/badge';
import classNames from 'classnames';
import './status-badge-cell.less';
import { RowData } from '@tanstack/table-core';
import { BaseCellProps } from '../../../types';

// Add constraint to TOptions
export interface StatusBadgeCellProps<
    TData extends RowData = RowData, // Add default
    TValue = unknown, // Add default
> extends BaseCellProps<TData, TValue>,
        BadgeProps {
    value?: string;
}

/**
 * A reusable component for displaying status tags in table cells
 */
// Add constraint to TOptions and use it
const StatusBadgeCellComponent = <
    TData extends RowData = RowData, // Add default
    TValue = unknown, // Add default
>({
    // Keep options optional here with default value
    value,
    color,
    className,
    style,
}: StatusBadgeCellProps<TData, TValue>) => {
    const tagColor = useMemo((): string => {
        // value might still be undefined or not in colorMap keys
        return color ?? '#ccc';
    }, [color, value]);

    // Custom style is needed for the color which is dynamic
    const tagStyle = useMemo(
        () => ({
            color: tagColor,
            ...style,
        }),
        [tagColor, style],
    );

    return (
        <Badge
            text={value}
            color={tagColor}
            className={classNames('status-badge-cell__badge', className)}
            style={tagStyle}
        />
    );
};

// Define a precise type for the memoized component with the constraint
type StatusBadgeCellType = <
    TData extends RowData = RowData, // Add default
    TValue = unknown, // Add default
>(
    props: StatusBadgeCellProps<TData, TValue>,
) => React.JSX.Element;

// Apply the precise type to the memoized component
export const StatusBadgeCell = React.memo(StatusBadgeCellComponent) as StatusBadgeCellType;
