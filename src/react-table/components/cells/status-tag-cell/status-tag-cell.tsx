import React, { useCallback, useMemo } from 'react';
import Tag from 'antd/es/tag';
import classNames from 'classnames';
import './status-tag-cell.less';
import { RowData } from '@tanstack/table-core';
import { BaseCellProps } from '../../../types';

// Define the required shape for TOptions
interface OptionShape {
    value: string;
    label: string;
}

// Add constraint to TOptions
export interface StatusTagCellProps<
    TOptions extends OptionShape = OptionShape, // Use the defined shape and add default
    TData extends RowData = RowData, // Add default
    TValue = unknown, // Add default
> extends BaseCellProps<TData, TValue> {
    value?: string;
    colorMap?: Record<string, string>;
    color?: string;
    options?: Array<TOptions>; // Keep options optional
    width?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * A reusable component for displaying status tags in table cells
 */
// Add constraint to TOptions and use it
const StatusTagCellComponent = <
    TOptions extends OptionShape = OptionShape, // Use the defined shape and add default
    TData extends RowData = RowData, // Add default
    TValue = unknown, // Add default
>({
    // Keep options optional here with default value
    value,
    colorMap,
    color,
    options,
    width,
    className,
    style,
}: StatusTagCellProps<TOptions, TData, TValue>) => {
    const getLabel = useCallback((): string => {
        if (!value) return '';
        // Remove type assertion (as any) since TOptions is constrained
        const option = options?.find((opt) => opt.value === value);
        // Remove type assertion for accessing label as well
        return option ? option.label : value;
    }, [value, options]);

    const tagColor = useMemo((): string => {
        // value might still be undefined or not in colorMap keys
        return color ?? colorMap?.[value || ''] ?? '#ccc';
    }, [color, colorMap, value]);

    // Custom style is needed for the color which is dynamic
    const tagStyle = useMemo(
        () => ({
            color: tagColor,
            borderColor: tagColor,
            width: width || undefined,
            ...style,
        }),
        [tagColor, width, style],
    );

    return (
        <Tag className={classNames('status-tag-cell__tag', className)} style={tagStyle}>
            {getLabel()}
        </Tag>
    );
};

// Define a precise type for the memoized component with the constraint
type StatusTagCellType = <
    TOptions extends OptionShape = OptionShape, // Use the defined shape and add default
    TData extends RowData = RowData, // Add default
    TValue = unknown, // Add default
>(
    props: StatusTagCellProps<TOptions, TData, TValue>,
) => React.JSX.Element;

// Apply the precise type to the memoized component
export const StatusTagCell = React.memo(StatusTagCellComponent) as StatusTagCellType;
