import Checkbox, { CheckboxChangeEvent, CheckboxProps } from 'antd/es/checkbox';
import { RowData } from '@tanstack/react-table';
import './checkbox-cell.less';
import { BaseCellProps } from '../../../types';
import { useCallback } from 'react';

export interface CheckboxCellProps<TData extends RowData, TValue>
    extends BaseCellProps<TData, TValue> {
    onChange?: (checked: boolean) => void;
    'aria-label'?: string;
    checkBoxProps?: CheckboxProps;
}

export const CheckboxCell = <TData extends RowData, TValue>({
    row,
    onChange,
    'aria-label': ariaLabel = 'Select row',
    checkBoxProps,
}: CheckboxCellProps<TData, TValue>) => {
    const { checked, indeterminate, ...rest } = checkBoxProps ?? {};
    const isSelected = row.getIsSelected();
    const isIndeterminate = row.getIsSomeSelected();

    const handleChange = useCallback(
        (e: CheckboxChangeEvent) => {
            row.getToggleSelectedHandler()(e as any);
            onChange?.(e.target.checked);
        },
        [row, onChange],
    );

    return (
        <div className='react-table-checkbox-cell'>
            <Checkbox
                checked={checked ?? isSelected}
                indeterminate={indeterminate ?? isIndeterminate}
                onChange={handleChange}
                aria-label={ariaLabel}
                {...rest}
            />
        </div>
    );
};

CheckboxCell.displayName = 'CheckboxCell';
