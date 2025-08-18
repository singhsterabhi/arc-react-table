import { ButtonProps } from 'antd/lib/button';
import { Table } from '@tanstack/react-table';

interface RowSelectionOriginal {
    selectedRows: any[];
}
interface RowSelectionTable {
    table?: Table<any>;
}
interface RowSelectionIsRowSelected {
    isRowSelected?: boolean;
}

type RowSelection = RowSelectionOriginal & RowSelectionTable & RowSelectionIsRowSelected;

export interface SelectedRowActionButtonProps extends Omit<ButtonProps, 'onClick'> {
    onClick: (e: React.MouseEvent<HTMLElement>, rowselection: RowSelection) => void;
    label?: string;
    getIsDisabled?: (rowselection: RowSelection) => boolean;
    tooltip?: string;
    getLabel?: (rowselection: RowSelection) => string;
}
