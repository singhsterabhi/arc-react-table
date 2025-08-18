import '@tanstack/react-table';
import { CellContextMenuAction, ColumnMetaCustom, ColumnPinningType } from './types';
import { TablePollingConfig } from './types';

declare module '@tanstack/react-table' {
    interface TableMeta<TData> {
        columnPinningType?: ColumnPinningType;
        getMaskedPopupContainer?: ((triggerNode: HTMLElement) => HTMLElement) | undefined;
        getParentMaskedPopupContainer?: ((triggerNode: HTMLElement) => HTMLElement) | undefined;
        loading?: boolean;
        filtersEnabled?: boolean;
        toggleFilters?: () => void;
        enableColumnFilters?: boolean;
        containerRef?: React.RefObject<HTMLDivElement>;
        scrollContainerRef?: React.RefObject<HTMLDivElement>;
        rowHeight?: number;
        scrollToRowById?: (rowId: string) => void;
        scrollToRowByEvent?: (event: MouseEvent<HTMLElement>) => void;
        // Table polling properties
        tablePolling?: {
            addRowToPolling: (row: any, shouldPoll?: boolean) => void;
            removeRowFromPolling: (rowId: string) => void;
            updateRowPollingState: (rowId: string, shouldPoll: boolean) => void;
            startPolling: () => void;
            stopPolling: () => void;
            clearAllRows: () => void;
        };
        tablePollingConfig?: TablePollingConfig | null;
        enableTablePolling?: boolean;
        enableCopyValue?: boolean;
        enableCellContextMenu?: boolean;
        cellContextMenuActions?: CellContextMenuAction[];
    }
    interface ColumnMeta<TData, TValue> extends ColumnMetaCustom<TData, TValue> {}
}
