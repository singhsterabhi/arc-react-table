import React, { useMemo } from 'react';
import classNames from 'classnames';
import './entity-cell.less';
import { RowData } from '@tanstack/table-core';
import { BaseCellProps } from '../../../types';
import { TextCell } from '../text-cell/text-cell';

export function numberKFormat(number: number, precision = 2) {
    const numberFormatter = new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: precision,
        minimumFractionDigits: precision,
    });
    return numberFormatter.format(number);
}

export interface EntityCellProps<TData extends RowData, TValue>
    extends BaseCellProps<TData, TValue> {
    icon?: React.ReactNode;
    align?: 'left' | 'right';
    value?: string | number;
    prefix?: string;
    suffix?: string;
    formatNumber?: boolean;
    precision?: number;
}

/**
 * A reusable component for displaying entity names in table cells
 */
const EntityCellComponent = <TData extends RowData, TValue>(
    props: EntityCellProps<TData, TValue>,
) => {
    const {
        value: componentValue = '',
        icon,
        align = 'left',
        prefix,
        suffix,
        formatNumber = false,
        precision = 2,
        className,
        ...restProps
    } = props;

    const rawValue = componentValue ?? ((restProps.cell.getValue() ?? '') as string | number);

    // Format the value if formatNumber is true and value is a number
    const value = useMemo(() => {
        if (formatNumber && typeof rawValue === 'number') {
            return numberKFormat(rawValue, precision);
        }
        return rawValue;
    }, [rawValue, formatNumber, precision]);

    // Memoize the formatted content to prevent unnecessary re-renders
    const content = useMemo(() => {
        if (icon || prefix || suffix) {
            return (
                <span className={classNames('entity-cell__content', className)}>
                    {icon && <span className='entity-cell__icon'>{icon}</span>}
                    {prefix && <span className='entity-cell__prefix'>{prefix}</span>}
                    <span
                        className={classNames('entity-cell__value', {
                            'text-right': align === 'right',
                        })}
                    >
                        <TextCell value={value} {...(restProps as any)} />
                    </span>
                    {suffix && <span className='entity-cell__suffix'>{suffix}</span>}
                </span>
            );
        }
        if (align === 'right') {
            return (
                <span className='entity-cell__value text-right'>
                    <TextCell value={value} {...(restProps as any)} />
                </span>
            );
        }

        return <TextCell value={value} {...(restProps as any)} />;
    }, [icon, value, align, prefix, suffix]);

    return <div className={classNames('entity-cell__container')}>{content}</div>;
};

// Use React.memo with proper typing to prevent unnecessary re-renders
export const EntityCell = React.memo(EntityCellComponent) as <TData extends RowData, TValue>(
    props: EntityCellProps<TData, TValue>,
) => React.JSX.Element;
