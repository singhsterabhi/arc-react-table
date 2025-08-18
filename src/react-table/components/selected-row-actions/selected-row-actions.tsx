import { Table } from '@tanstack/react-table';
import Button from 'antd/lib/button';
import { SelectedRowActionButtonProps } from './types';
import './selected-row-actions.less';
import CloseOutlined from '@ant-design/icons/lib/icons/CloseOutlined';
import Tooltip from 'antd/es/tooltip';

export const SelectedRowActions = ({
    table,
    rowSelectionActions,
    showToggleAllRowsSelected = true,
}: {
    table: Table<any>;
    rowSelectionActions: SelectedRowActionButtonProps[];
    showToggleAllRowsSelected?: boolean;
}) => {
    const filteredSelectedRows = table.getSelectedRowModel().rows;
    const selectedRowCount = filteredSelectedRows.length;

    let isRowSelected = table.getIsAllRowsSelected() || table.getIsSomeRowsSelected();

    const toggleAllRowsSelected = isRowSelected
        ? () => table.resetRowSelection()
        : () => table.toggleAllRowsSelected();

    return (
        <>
            <div className='react-table-selected-row-actions'>
                {showToggleAllRowsSelected && (
                    <ActionButton
                        action={{
                            label: `${selectedRowCount > 0 ? selectedRowCount : 'No'} Rows Selected`,
                            icon: <CloseOutlined />,
                            iconPosition: 'end',
                            onClick: toggleAllRowsSelected,
                            className: 'react-table-selected-row-action',
                            disabled: false,
                            tooltip: selectedRowCount > 0 ? 'Clear selection' : 'Select all rows',
                        }}
                    />
                )}
                {rowSelectionActions.map((action, index) => (
                    <ActionButton
                        key={action.label ?? index}
                        action={action}
                        isRowSelected={isRowSelected}
                        selectedRows={filteredSelectedRows}
                        table={table}
                    />
                ))}
            </div>
        </>
    );
};

const ActionButton = ({
    action,
    isRowSelected,
    table,
    selectedRows: selectedRowsProp,
}: {
    action: SelectedRowActionButtonProps;
    isRowSelected?: boolean;
    table?: Table<any>;
    selectedRows?: any[];
}) => {
    const { getIsDisabled, onClick, className, disabled, label, getLabel, tooltip, ...rest } =
        action;
    let selectedRows = selectedRowsProp ?? [];
    return (
        <Tooltip title={tooltip} placement='left'>
            <Button
                {...rest}
                size='small'
                className={`react-table-selected-row-action ${className}`}
                disabled={
                    disabled ??
                    getIsDisabled?.({ selectedRows, table, isRowSelected }) ??
                    !isRowSelected
                }
                onClick={(e) => action.onClick(e, { selectedRows, table, isRowSelected })}
            >
                {label ?? getLabel?.({ selectedRows, table, isRowSelected })}
            </Button>
        </Tooltip>
    );
};
