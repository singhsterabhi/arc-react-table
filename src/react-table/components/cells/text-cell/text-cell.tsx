import { RowData } from '@tanstack/react-table';
import { BaseCellProps } from '../../../types';
import { useMemo } from 'react';
import Typography from 'antd/es/typography';
import classNames from 'classnames';
import React from 'react';

interface TextCellProps<TData extends RowData, TValue> extends BaseCellProps<TData, TValue> {
    value?: string | number;
}

const TextCellComponent = <TData extends RowData, TValue>(props: TextCellProps<TData, TValue>) => {
    const { value: valueProp, className, ...restProps } = props;
    const table = restProps.table;
    const value = valueProp ?? ((restProps.getValue() ?? '') as string | number);

    // Extract only the required function from table to prevent unnecessary re-renders
    const getPopupContainer =
        table?.options.meta?.getParentMaskedPopupContainer ||
        table?.options.meta?.getMaskedPopupContainer;

    const ellipsis = useMemo(() => {
        return {
            tooltip: {
                title: value,
                destroyTooltipOnHide: true,
                getPopupContainer,
                autoAdjustOverflow: true,
                overlayStyle: {
                    maxWidth: '400px',
                    wordBreak: 'break-word' as const,
                    whiteSpace: 'normal' as const,
                },
            },
        };
    }, [value, getPopupContainer]);

    return (
        <div className={classNames('text-cell__container', className)}>
            <Typography.Text ellipsis={ellipsis}>{value}</Typography.Text>
        </div>
    );
};

const TextCellMemo = React.memo(TextCellComponent, (prevProps, nextProps) => {
    const prevValue = prevProps.value ?? prevProps.getValue();
    const nextValue = nextProps.value ?? nextProps.getValue();

    return prevValue === nextValue && prevProps.className === nextProps.className;
});

export const TextCell = TextCellMemo as <TData extends RowData, TValue>(
    props: TextCellProps<TData, TValue>,
) => React.JSX.Element;
