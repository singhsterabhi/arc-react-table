import Checkbox from 'antd/es/checkbox';
import { RowData } from '@tanstack/react-table';
import './checkbox-header.less';
import { BaseHeaderProps } from '../../../types';

export interface CheckboxHeaderProps<TData extends RowData, TValue>
    extends BaseHeaderProps<TData, TValue> {}

export const CheckboxHeader = <TData extends RowData, TValue>({
    table,
}: CheckboxHeaderProps<TData, TValue>) => {
    // const selectedFilteredRows = table.getFilteredSelectedRowModel().rows;
    const allRows = table.getFilteredRowModel().rows;
    // const isAllRowsSelected =
    //     selectedFilteredRows.length > 0 && selectedFilteredRows.length === allRows.length;
    // const isSomeRowsSelected = selectedFilteredRows.length > 0;
    const isAllRowsSelected = table.getIsAllRowsSelected();
    const isSomeRowsSelected = table.getIsSomeRowsSelected();
    const toggleAllRowsSelected = table.getToggleAllRowsSelectedHandler();
    return (
        <div className='react-table-checkbox-header'>
            <Checkbox
                checked={isAllRowsSelected}
                indeterminate={isSomeRowsSelected && !isAllRowsSelected}
                onChange={toggleAllRowsSelected}
                disabled={allRows.length === 0}
            />
        </div>
    );
};
