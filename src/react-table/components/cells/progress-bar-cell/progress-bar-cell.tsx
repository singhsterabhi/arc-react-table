import React, { useMemo, CSSProperties } from 'react';
import Tooltip from 'antd/es/tooltip';
import classNames from 'classnames';
import './progress-bar-cell.less';
import { RowData } from '@tanstack/react-table';
import { BaseCellProps } from '../../../types';

// Assume TValue will be a number for progress bar
export interface ProgressBarCellProps<TData extends RowData, TValue>
    extends BaseCellProps<TData, TValue> {
    status?: string;
    statusLabel?: string;
    colorMap?: Record<string, string>;
    showPercentage?: boolean;
    width?: string | number;
    height?: string | number;
    className?: string;
    style?: React.CSSProperties;
    tooltip?: string;
    backgroundColor?: string;
    value?: number;
}

/**
 * A reusable component for displaying progress bars in table cells
 */
const ProgressBarCellComponent = <TData extends RowData, TValue>(
    props: ProgressBarCellProps<TData, TValue>,
) => {
    const {
        cell,
        value: valueProp,
        status,
        statusLabel,
        colorMap = {},
        showPercentage = true,
        width = '100%',
        height = '14px',
        className,
        style,
        tooltip,
        backgroundColor = '#f5f5f5',
    } = props;

    const value = valueProp ?? (cell.getValue() as number); // Use cell.getValue()
    const table = cell.getContext().table;

    // Ensure value is between 0-100
    const progressValue = useMemo(
        () => Math.min(Math.max(0, Math.round(value ?? 0)), 100),
        [value],
    );

    // Memoize the color calculation to prevent recalculation on each render
    const barColor = useMemo(() => {
        return status && colorMap[status] ? colorMap[status] : 'orange';
    }, [status, colorMap]);

    // Memoize only the dynamic style properties
    const containerStyle = useMemo(() => ({ width, ...style }), [width, style]);

    const backgroundStyle = useMemo(
        (): CSSProperties => ({
            height,
            background: backgroundColor,
        }),
        [height, backgroundColor],
    );

    const fillStyle = useMemo(
        (): CSSProperties => ({
            width: `${progressValue}%`,
            background: barColor,
        }),
        [progressValue, barColor],
    );

    const labelStyle = useMemo(
        (): CSSProperties => ({
            color: progressValue > 50 ? '#fff' : '#000',
        }),
        [progressValue],
    );

    const percentageStyle = useMemo(
        (): CSSProperties => ({
            color: barColor,
        }),
        [barColor],
    );

    // Memoize the entire progress bar component
    const progressBar = useMemo(
        () => (
            <div
                className={classNames('progress-bar-cell__container', className)}
                style={containerStyle}
            >
                <div className='progress-bar-cell__background' style={backgroundStyle}>
                    <div className='progress-bar-cell__fill' style={fillStyle} />
                    {statusLabel && (
                        <div className='progress-bar-cell__label' style={labelStyle}>
                            {statusLabel}
                        </div>
                    )}
                </div>
                {showPercentage && (
                    <span className='progress-bar-cell__percentage' style={percentageStyle}>
                        {progressValue}%
                    </span>
                )}
            </div>
        ),
        [
            className,
            containerStyle,
            backgroundStyle,
            fillStyle,
            labelStyle,
            percentageStyle,
            statusLabel,
            showPercentage,
            progressValue,
        ],
    );

    // Return memoized result with or without tooltip
    const finalComponent = useMemo(() => {
        if (tooltip || (tooltip === undefined && statusLabel)) {
            return (
                <Tooltip
                    title={tooltip || `${progressValue}% complete`}
                    destroyTooltipOnHide={true}
                    getPopupContainer={table?.options.meta?.getMaskedPopupContainer}
                >
                    {progressBar}
                </Tooltip>
            );
        }
        return progressBar;
    }, [progressBar, tooltip, statusLabel, progressValue, table]); // Added table dependency

    return finalComponent;
};

export const ProgressBarCell = React.memo(ProgressBarCellComponent) as <
    TData extends RowData,
    TValue,
>(
    props: ProgressBarCellProps<TData, TValue>,
) => React.JSX.Element;
