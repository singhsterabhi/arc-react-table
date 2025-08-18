import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    ColumnMeta,
    ColumnOrderState,
    ColumnPinningState,
    ColumnSizingState,
    ExpandedState,
    PaginationState,
    Row,
    RowSelectionState,
    SortingState,
    Table,
    VisibilityState,
} from '@tanstack/react-table';
import { MutableRefObject, ReactNode } from 'react';
import { ContainerDimensionsHandle } from '../hooks/use-container-dimensions';
import { SelectedRowActionButtonProps } from '../components';
import { MenuProps } from 'antd';
export type ColumnPinningType = 'left' | 'right' | 'inplace' | 'inplace-right' | 'toggle';

// Row Polling Types
export interface RowPollingConfig {
    enabled: boolean;
    interval?: number;
    onPoll: (row: Row<any>) => Promise<Partial<any>> | Partial<any>;
    select?: (data: Partial<any>) => Partial<any>;
}

export type GetRowPollingConfig = (row: Row<any>) => RowPollingConfig | null;

export type UpdateRowData = (rowId: string, updatedData: Partial<any>) => void;

// Table Polling Types
export interface TablePollingConfig {
    enabled: boolean;
    interval?: number;
    shouldPollRow: (row: Row<any>) => boolean;
    onPoll: (rows: Row<any>[]) => Promise<Partial<any>[]> | Partial<any>[];
    select?: (data: Partial<any>[]) => Partial<any>[];
}

export type GetTablePollingConfig = () => TablePollingConfig | null;

export type UpdateTableData = (updatedDataArray: Array<any>) => void;

// Cell Context Menu Types
type ItemType = Required<MenuProps>['items'][number];
export type MajorGroups = 'cell' | 'row' | 'selection' | 'table';
export interface CellContextMenuAction
    extends Omit<ItemType, 'onClick' | 'key' | 'icon' | 'disabled' | 'tooltip'> {
    label?: ReactNode | string;
    tooltip?: string | ((context: CellContextMenuContext) => string);
    onClick?: (context: CellContextMenuContext) => void;
    getOnClickFunction?: (context: CellContextMenuContext) => () => void;
    disabled?: boolean | ((context: CellContextMenuContext) => boolean);
    getDisabledFunction?: (context: CellContextMenuContext) => () => boolean;
    visible?: boolean | ((context: CellContextMenuContext) => boolean);
    key: string;
    icon?: React.ReactNode;
    group?: MajorGroups | string;
}

export interface CellContextMenuContext {
    cell: any;
    row: any;
    column: any;
    table: any;
    value: any;
    rowData: any;
}

export interface ColumnMetaCustom<TData, TValue> {
    Filter?: (props: { column?: Column<TData, TValue>; table?: Table<TData> }) => React.JSX.Element;
    showPinning?: boolean;
    showHeaderActionItems?: boolean;
    enableCellContextMenu?: boolean;
    cellContextMenuActions?: CellContextMenuAction[];
    enableCopyValue?: boolean;
    quickFilterOptions?: Array<{ value: any; label: string }>;
}

export type ColumnConfig = Omit<ColumnDef<any>, 'accessorKey'> & {
    id: string;
    accessorFn?: (row: Row<any>) => any;
    meta?: ColumnMeta<any, any> & ColumnMetaCustom<any, any>;
};

export interface ReactTableProps {
    // Data & Columns
    columns: ColumnConfig[];
    data: any[];
    cellRenderers?: Record<string, (props: any) => ReactNode>;
    // Loading
    loading?: boolean;
    loaderType?: 'full' | 'table';
    loaderIcon?: React.ReactElement;
    // Sorting
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
    // Expanding
    enableExpanding?: boolean;
    enableExpandAll?: boolean;
    expanded?: ExpandedState;
    getSubRows?: (originalRow: any) => any[];
    onExpandedChange?: (expanded: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void;
    toggleExpandAllRows?: boolean;
    enableExclusiveRowExpansion?: boolean;
    // Detail Panel
    renderDetailPanel?: (props: RenderDetailPanelProps) => React.ReactNode;
    getRowId?: (originalRow: any, index: number, parent: any) => string;
    // Row Selection
    enableRowSelection?: boolean;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (
        rowSelection: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState),
    ) => void;
    expandRowTitle?: string;
    // Pagination
    enablePagination?: boolean;
    paginationType?: 'standard' | 'cursor';
    pagination?: PaginationState & { pageSizeOptions?: number[] };
    onPaginationChange?: (
        pagination: PaginationState | ((prev: PaginationState) => PaginationState),
    ) => void;
    rowCount?: number;
    // Infinite Scroll
    enableInfiniteScroll?: boolean;
    onLoadMore?: () => void;
    hasMoreData?: boolean;
    infiniteScrollThreshold?: number;
    hideInfiniteScrollLoader?: boolean;
    // Column Filtering
    columnFilters?: ColumnFiltersState;
    enableColumnFilters?: boolean;
    onColumnFiltersChange?: (
        filters: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState),
    ) => void;
    // Column Visibility
    columnVisibility?: VisibilityState;
    onColumnVisibilityChange?: (
        visibility: VisibilityState | ((prev: VisibilityState) => VisibilityState),
    ) => void;
    // Row virtualization
    enableRowVirtualization?: boolean;
    rowHeight?: number;
    // Row Polling
    enableRowPolling?: boolean;
    defaultPollingInterval?: number;
    getRowPollingConfig?: GetRowPollingConfig;
    updateRowData?: UpdateRowData;
    // Table Polling
    enableTablePolling?: boolean;
    defaultTablePollingInterval?: number;
    getTablePollingConfig?: GetTablePollingConfig;
    updateTableData?: UpdateTableData;
    // Toolbars
    bottomToolbarComponent?: React.ReactNode;
    enableBottomToolbar?: boolean;
    enableTopToolbar?: boolean;
    showToggleAllRowsSelected?: boolean;
    // Quick Filters
    enableQuickFilters?: boolean;
    quickFilterColumns?: string[];
    // Column Ordering
    columnOrder?: string[];
    enableColumnOrdering?: boolean;
    onColumnOrderChange?: (columnOrder: string[] | ((prev: string[]) => string[])) => void;
    // Column Pinning
    columnPinning?: ColumnPinningState;
    enableColumnPinning?: boolean;
    onColumnPinningChange?: (
        columnPinning: ColumnPinningState | ((prev: ColumnPinningState) => ColumnPinningState),
    ) => void;
    columnPinningType?: ColumnPinningType;
    // Column Sizing
    columnSizing?: ColumnSizingState;
    enableColumnSizing?: boolean;
    onColumnSizingChange?: (
        columnSizing: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState),
    ) => void;
    // Column Menu / Toggles
    enableColumnFilterToggle?: boolean;
    initialColumnFilterToggle?: boolean;
    enableColumnMenu?: boolean;
    // Export
    enableExport?: boolean;
    onExport?: (data: any[]) => void;
    // Footer
    showFooter?: boolean;
    // Table Config Persistence
    enableTableConfigPersistence?: boolean;
    tableConfigKey?: string;
    // Cell Context Menu
    enableCellContextMenu?: boolean;
    enableCopyValue?: boolean;
    cellContextMenuActions?: CellContextMenuAction[];
    // Miscellaneous
    debugTable?: boolean;
    initialState?: {
        expanded?: ExpandedState;
        sorting?: SortingState;
        columnPinning?: ColumnPinningState;
        rowSelection?: RowSelectionState;
        columnFilters?: ColumnFiltersState;
        pagination?: PaginationState;
        columnSizing?: ColumnSizingState;
        columnOrder?: ColumnOrderState;
        columnVisibility?: VisibilityState;
    };
    setContainerDimensions?: (dimensions: { width: number; height: number }) => void;
    dimensionsRef?: MutableRefObject<ContainerDimensionsHandle | null>;
    preventScrollBubbling?: boolean;
    leftToolbarComponent?: React.ReactNode;
    rightToolbarComponent?: React.ReactNode;
    rowSelectionActions?: SelectedRowActionButtonProps[];
    tableTitle?: string | React.ReactNode;
    className?: string;
    isFullHeight?: boolean;
    getParentMaskedPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
}

export interface RenderDetailPanelProps {
    row: Row<any>;
    table?: Table<any>;
    contentMeasurements?: { width: number; height: number };
    setWidth?: (width: number) => void;
    setHeight?: (height: number | undefined) => void;
}
