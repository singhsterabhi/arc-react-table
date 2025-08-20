import {
    ColumnPinningState,
    getCoreRowModel,
    getExpandedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    TableMeta,
    useReactTable,
} from '@tanstack/react-table';
import React, { memo, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactTableHeader from './components/header/header';
import './react-table.less';
import ReactTableLoader from './components/loader/loader';
import ReactTableBody from './components/body/body';
import ReactTableFooter from './components/footer/footer';
import ReactTableTopToolbar from './components/toolbar/toolbar';
import ReactTableBottomToolbar from './components/bottom-toolbar/bottom-toolbar';
import classNames from 'classnames';
import FullLoader from './components/full-loader/full-loader';
import NoData from './components/no-data/no-data';
import { ReactTableProps } from './types';
import {
    useAddExtraColumn,
    useColumnOrder,
    useColumnPinning,
    useColumnSizing,
    useColumnFilters,
    useColumnVisibility,
    useFilterToggle,
    useContainerDimensions,
    useEnhancedColumns,
    useMaskedPopupContainer,
    usePagination,
    useRowExpansion,
    useRowSelection,
    useSorting,
    useInfiniteScroll,
    useTableConfigPersistence,
    useTablePolling,
} from './hooks';
import { ConditionalQueryClientProvider } from './components';

const defaultPagination = {
    pageIndex: 0,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
};
const emptyData: any[] = [];
const defaultColumn = {
    minSize: 20,
    maxSize: Number.MAX_SAFE_INTEGER,
};

const getColumnPinningState = (
    state: ColumnPinningState,
    enableExpanding: boolean,
    enableRowSelection: boolean,
) => {
    if (state?.left && state.left.length > 0) {
        const left = [];
        if (enableExpanding && !state.left.includes('react-table-row-expand')) {
            left.push('react-table-row-expand');
        }
        if (enableRowSelection && !state.left.includes('react-table-row-select')) {
            left.push('react-table-row-select');
        }
        return left.length > 0 ? { ...state, left: [...left, ...state.left] } : state;
    }
    return state;
};

const ReactTable = ({
    // Data & Columns
    columns,
    data = emptyData,
    cellRenderers,
    // Loading
    loading = false,
    loaderType = 'full',
    loaderIcon,
    // Sorting
    sorting,
    onSortingChange,
    // Expanding
    enableExpanding = false,
    enableExpandAll = false,
    expanded,
    getSubRows,
    onExpandedChange,
    toggleExpandAllRows = false,
    enableExclusiveRowExpansion = false,
    // Detail Panel
    renderDetailPanel,
    getRowId,
    // Row Selection
    enableRowSelection = false,
    rowSelection,
    onRowSelectionChange,
    expandRowTitle = 'Expand',
    // Pagination
    enablePagination = true,
    paginationType = 'standard',
    pagination = defaultPagination,
    onPaginationChange,
    rowCount,
    // Infinite Scroll
    enableInfiniteScroll = false,
    onLoadMore,
    hasMoreData = false,
    infiniteScrollThreshold = 100,
    hideInfiniteScrollLoader = false,
    // Column Filtering
    columnFilters,
    enableColumnFilters = true,
    onColumnFiltersChange,
    // Column Visibility
    columnVisibility,
    onColumnVisibilityChange,
    // Row Virtualization
    enableRowVirtualization = false,
    rowHeight = 40,
    // Row Polling
    enableRowPolling = false,
    defaultPollingInterval = 30000,
    getRowPollingConfig,
    updateRowData,
    // Table Polling
    enableTablePolling = false,
    defaultTablePollingInterval = 30000,
    getTablePollingConfig,
    updateTableData,
    // Toolbars
    bottomToolbarComponent,
    enableBottomToolbar = true,
    enableTopToolbar = true,
    showToggleAllRowsSelected = true,
    // Quick Filters
    enableQuickFilters = true,
    quickFilterColumns = emptyData,
    // Column Ordering
    columnOrder,
    onColumnOrderChange,
    // Column Pinning
    columnPinning,
    enableColumnPinning = true,
    onColumnPinningChange,
    columnPinningType = 'inplace',
    // Column Sizing
    columnSizing,
    enableColumnSizing = true,
    onColumnSizingChange,
    // Column Menu / Toggles
    enableColumnFilterToggle = true,
    initialColumnFilterToggle = true,
    enableColumnMenu = true,
    // Export
    enableExport = false,
    onExport,
    // Footer
    showFooter = false,
    // Table Config Persistence
    enableTableConfigPersistence = false,
    tableConfigKey,
    // Cell Context Menu
    enableCellContextMenu = false,
    enableCopyValue = true,
    cellContextMenuActions = [],
    // Miscellaneous
    debugTable = false,
    initialState,
    setContainerDimensions,
    dimensionsRef,
    preventScrollBubbling = false,
    leftToolbarComponent,
    rightToolbarComponent,
    rowSelectionActions,
    tableTitle,
    className,
    isFullHeight = false,
    getParentMaskedPopupContainer,
    size = 'md',
    widgetButtonSize = 'md',
}: ReactTableProps): React.JSX.Element => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalPageCountForStandardPagination = rowCount ?? data.length;

    const { maskedPopupContainer, getMaskedPopupContainer } = useMaskedPopupContainer();

    const isManualSorting = !!(onSortingChange || sorting);
    const isManualColumnFiltering = !!(onColumnFiltersChange || columnFilters);
    const isManualPaginationHook = !!(onPaginationChange || pagination);
    const isManualColumnOrdering = !!(onColumnOrderChange || columnOrder);
    const isManualColumnPinning = !!(onColumnPinningChange || columnPinning);
    const isManualRowSelection = !!(onRowSelectionChange || rowSelection);
    const isManualColumnVisibility = !!(onColumnVisibilityChange || columnVisibility);
    const isManualExpanding = !!(onExpandedChange || expanded);
    const isManualColumnSizing = !!(onColumnSizingChange || columnSizing);

    const { sortingState, handleSortingChange } = useSorting(
        initialState?.sorting,
        onSortingChange,
    );
    const { expandedState, handleExpandedChange, scrollToRowById, scrollToRowByEvent } =
        useRowExpansion(
            initialState?.expanded,
            onExpandedChange,
            enableExclusiveRowExpansion,
            scrollContainerRef as React.RefObject<HTMLElement>,
        );
    const { rowSelectionState, handleRowSelectionChange } = useRowSelection(
        initialState?.rowSelection,
        onRowSelectionChange,
    );
    const { paginationState, handlePaginationChange } = usePagination(
        initialState?.pagination,
        onPaginationChange,
        paginationType === 'cursor' ? Number.MAX_SAFE_INTEGER : totalPageCountForStandardPagination,
    );
    const { columnOrderState, handleColumnOrderChange } = useColumnOrder(
        initialState?.columnOrder,
        onColumnOrderChange,
    );
    const { columnPinningState, handleColumnPinningChange } = useColumnPinning(
        initialState?.columnPinning,
        onColumnPinningChange,
    );
    const { columnSizingState, handleColumnSizingChange } = useColumnSizing(
        initialState?.columnSizing,
        onColumnSizingChange,
    );
    const { columnFiltersState, handleColumnFiltersChange } = useColumnFilters(
        initialState?.columnFilters,
        onColumnFiltersChange,
    );
    const { columnVisibilityState, handleColumnVisibilityChange } = useColumnVisibility(
        initialState?.columnVisibility,
        onColumnVisibilityChange,
    );
    const { filtersEnabled, toggleFilters } = useFilterToggle(
        initialColumnFilterToggle,
        enableColumnFilters,
    );

    const enhancedColumns = useEnhancedColumns({
        columns,
        enableRowSelection,
        enableExpanding,
        enableExpandAll,
        renderDetailPanel,
        expandRowTitle,
        enableColumnFilters,
    });

    const infiniteScrollResult = useInfiniteScroll(
        scrollContainerRef as React.RefObject<HTMLDivElement>,
        loading,
        hasMoreData,
        onLoadMore,
        infiniteScrollThreshold,
        enableInfiniteScroll,
    );

    const { isInfiniteScrollActive, sentinelRef, isLoadingMore } = infiniteScrollResult;

    const tablePollingConfig = useMemo(() => {
        return enableTablePolling && getTablePollingConfig ? getTablePollingConfig() : null;
    }, [enableTablePolling, getTablePollingConfig]);

    const tablePolling = useTablePolling({
        pollingConfig: tablePollingConfig,
        defaultInterval: defaultTablePollingInterval,
        updateTableData,
        enabled: enableTablePolling,
        tableConfigKey: tableConfigKey,
    });

    const showPagination = enablePagination && !enableInfiniteScroll;

    const shouldShowLoader = enableInfiniteScroll
        ? isLoadingMore
            ? false
            : pagination.pageIndex === 0 && loading
        : loading;
    const shouldShowContent = !shouldShowLoader && data.length > 0;
    const shouldShowNoData = !shouldShowLoader && data.length === 0;

    const currentExpanded = isManualExpanding ? expanded : expandedState;
    const currentSorting = isManualSorting ? (sorting ?? sortingState) : sortingState;
    const currentColumnPinning = isManualColumnPinning
        ? columnPinning
        : getColumnPinningState(columnPinningState, enableExpanding, enableRowSelection);
    const currentRowSelection = isManualRowSelection ? rowSelection : rowSelectionState;
    const currentColumnFilters = isManualColumnFiltering ? columnFilters : columnFiltersState;
    const currentColumnOrder = isManualColumnOrdering ? columnOrder : columnOrderState;
    const currentColumnSizing = isManualColumnSizing ? columnSizing : columnSizingState;
    const currentPagination = isManualPaginationHook ? pagination : paginationState;
    const currentColumnVisibility = isManualColumnVisibility
        ? columnVisibility
        : columnVisibilityState;

    const defaultGetRowId = useCallback((originalRow: any, index: number, parent?: Row<any>) => {
        const row = originalRow as Record<string, any>;
        const parentPrefix = parent?.parentId
            ? `${parent.parentId}.`
            : parent?.id
              ? `${parent.id}.`
              : '';
        return `${parentPrefix}${row.id ?? index}`;
    }, []);

    const memoizedGetRowId = getRowId || defaultGetRowId;

    const tableMeta = useMemo(
        () =>
            ({
                columnPinningType,
                getMaskedPopupContainer,
                getParentMaskedPopupContainer,
                loading: shouldShowLoader,
                filtersEnabled,
                toggleFilters,
                enableColumnFilters,
                containerRef,
                scrollContainerRef,
                rowHeight,
                scrollToRowById,
                scrollToRowByEvent,
                // Table polling context
                tablePolling: enableTablePolling ? tablePolling : undefined,
                tablePollingConfig: enableTablePolling ? tablePollingConfig : undefined,
                enableTablePolling,
                // Cell context menu context
                enableCopyValue,
                enableCellContextMenu,
                cellContextMenuActions,
            }) as TableMeta<any>,
        [
            columnPinningType,
            getMaskedPopupContainer,
            getParentMaskedPopupContainer,
            shouldShowLoader,
            filtersEnabled,
            toggleFilters,
            enableColumnFilters,
            rowHeight,
            scrollToRowById,
            scrollToRowByEvent,
            enableTablePolling,
            tablePolling,
            tablePollingConfig,
            enableCopyValue,
            enableCellContextMenu,
            cellContextMenuActions,
        ],
    );

    const pageCount = useMemo(() => {
        if (paginationType === 'cursor') return -1;
        if (!enablePagination) return undefined;
        const pageSize = currentPagination.pageSize || defaultPagination.pageSize;
        return Math.ceil(totalPageCountForStandardPagination / pageSize);
    }, [
        paginationType,
        enablePagination,
        totalPageCountForStandardPagination,
        currentPagination.pageSize,
    ]);

    const tableConfig = useMemo(
        () => ({
            data,
            columns: enhancedColumns as any,
            state: {
                expanded: currentExpanded,
                sorting: currentSorting,
                columnPinning: currentColumnPinning,
                rowSelection: currentRowSelection,
                columnOrder: currentColumnOrder,
                columnSizing: currentColumnSizing,
                columnFilters: currentColumnFilters,
                pagination: currentPagination,
                columnVisibility: currentColumnVisibility,
            },
            manualSorting: isManualSorting,
            enableSorting: true,
            enableColumnResizing: enableColumnSizing,
            enableColumnPinning: enableColumnPinning,
            enableSortingRemoval: true,
            sortDescFirst: true,
            manualFiltering: isManualColumnFiltering,
            manualPagination: paginationType === 'cursor' || isManualPaginationHook,
            pageCount,
            defaultColumn,
            columnResizeMode: 'onChange' as const,
            onExpandedChange: isManualExpanding ? onExpandedChange : handleExpandedChange,
            onSortingChange: isManualSorting ? onSortingChange : handleSortingChange,
            onColumnPinningChange: isManualColumnPinning
                ? onColumnPinningChange
                : handleColumnPinningChange,
            onColumnOrderChange: isManualColumnOrdering
                ? onColumnOrderChange
                : handleColumnOrderChange,
            onColumnSizingChange: isManualColumnSizing
                ? onColumnSizingChange
                : handleColumnSizingChange,
            onColumnFiltersChange: isManualColumnFiltering
                ? onColumnFiltersChange
                : handleColumnFiltersChange,
            onRowSelectionChange: isManualRowSelection
                ? onRowSelectionChange
                : handleRowSelectionChange,
            onColumnVisibilityChange: isManualColumnVisibility
                ? onColumnVisibilityChange
                : handleColumnVisibilityChange,
            onPaginationChange: isManualPaginationHook
                ? onPaginationChange
                : handlePaginationChange,
            getSubRows,
            getRowId: memoizedGetRowId,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
            getFacetedUniqueValues: getFacetedUniqueValues(),
            getPaginationRowModel:
                enablePagination && paginationType === 'standard'
                    ? getPaginationRowModel()
                    : undefined,
            enableRowSelection,
            debugTable,
            getRowCanExpand: renderDetailPanel ? () => true : undefined,
            enableExpanding,
            meta: tableMeta,
        }),
        [
            data,
            enhancedColumns,
            currentExpanded,
            currentSorting,
            currentColumnPinning,
            currentRowSelection,
            currentColumnOrder,
            currentColumnSizing,
            currentColumnFilters,
            currentPagination,
            currentColumnVisibility,
            isManualSorting,
            enableColumnSizing,
            enableColumnPinning,
            isManualColumnFiltering,
            paginationType,
            isManualPaginationHook,
            pageCount,
            isManualExpanding,
            onExpandedChange,
            handleExpandedChange,
            onSortingChange,
            handleSortingChange,
            isManualColumnPinning,
            onColumnPinningChange,
            handleColumnPinningChange,
            isManualColumnOrdering,
            onColumnOrderChange,
            handleColumnOrderChange,
            isManualColumnSizing,
            onColumnSizingChange,
            handleColumnSizingChange,
            onColumnFiltersChange,
            handleColumnFiltersChange,
            isManualRowSelection,
            onRowSelectionChange,
            handleRowSelectionChange,
            isManualColumnVisibility,
            onColumnVisibilityChange,
            handleColumnVisibilityChange,
            onPaginationChange,
            handlePaginationChange,
            getSubRows,
            memoizedGetRowId,
            enablePagination,
            enableRowSelection,
            debugTable,
            renderDetailPanel,
            enableExpanding,
            tableMeta,
        ],
    );

    const table = useReactTable(tableConfig);

    useTableConfigPersistence({
        tableConfigKey,
        enableTableConfigPersistence,
        table,
    });

    useEffect(() => {
        if (toggleExpandAllRows || enableExpandAll) {
            table.toggleAllRowsExpanded(true);
        }
    }, [toggleExpandAllRows, enableExpandAll, table]);

    useEffect(() => {
        if (loading && !isLoadingMore) {
            table.resetRowSelection();
            table.resetExpanded();
            table.resetColumnFilters();
        }
    }, [table, loading, isLoadingMore]);

    useContainerDimensions(containerRef, setContainerDimensions, dimensionsRef);

    const addExtraColumn = useAddExtraColumn(table as any);

    const handleWheel = useCallback((event: WheelEvent) => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer?.contains(event.target as Node)) return;

        const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } =
            scrollContainer;
        const { deltaY, deltaX } = event;
        const tolerance = 1;

        let canScrollVertically = false;
        let canScrollHorizontally = false;

        if (deltaY !== 0) {
            canScrollVertically =
                deltaY < 0
                    ? scrollTop > tolerance
                    : scrollTop + clientHeight < scrollHeight - tolerance;
        }

        if (deltaX !== 0) {
            canScrollHorizontally =
                deltaX < 0
                    ? scrollLeft > tolerance
                    : scrollLeft + clientWidth < scrollWidth - tolerance;
        }

        if (canScrollVertically || canScrollHorizontally) {
            event.stopPropagation();
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    }, []);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (preventScrollBubbling && scrollContainer) {
            scrollContainer.addEventListener('wheel', handleWheel, {
                passive: false,
            });
            return () => scrollContainer.removeEventListener('wheel', handleWheel);
        }
    }, [preventScrollBubbling, handleWheel]);

    const sentinelElement =
        isInfiniteScrollActive && shouldShowContent ? (
            <div
                ref={sentinelRef}
                className='react-table-infinite-sentinel'
                data-testid='infinite-scroll-sentinel'
            >
                {isLoadingMore && !hideInfiniteScrollLoader && (
                    <div className='infinite-scroll-loading-indicator'>Loading data...</div>
                )}
            </div>
        ) : null;

    const containerClasses = classNames('react-table-container', className, {
        'react-table-container-loading': shouldShowLoader,
        'react-virtualized-container': enableRowVirtualization,
        'react-table-container-full-height': isFullHeight,
        'react-table-container-small': size === 'sm',
        'react-table-container-medium': size === 'md',
        'react-table-container-large': size === 'lg',
    });

    const tableClasses = classNames('react-table', {
        'react-table-loading': shouldShowLoader,
        'react-table-no-data': data.length === 0,
        'react-table-infinite-scroll': enableInfiniteScroll,
    });

    return (
        <div className={containerClasses} ref={containerRef}>
            <div id='react-table-masked-popup-container' ref={maskedPopupContainer}></div>
            {shouldShowLoader && loaderType === 'full' && <FullLoader loaderIcon={loaderIcon} />}
            {enableTopToolbar && (
                <ReactTableTopToolbar
                    enableQuickFilters={enableQuickFilters}
                    table={table}
                    quickFilterColumns={quickFilterColumns}
                    enableColumnMenu={enableColumnMenu}
                    enableColumnFilters={enableColumnFilters}
                    enableColumnFilterToggle={enableColumnFilterToggle}
                    enableExport={enableExport}
                    onExport={onExport}
                    leftToolbarComponent={leftToolbarComponent}
                    rightToolbarComponent={rightToolbarComponent}
                    rowSelectionActions={rowSelectionActions}
                    tableTitle={tableTitle}
                    showToggleAllRowsSelected={showToggleAllRowsSelected}
                    widgetButtonSize={widgetButtonSize}
                />
            )}
            <div ref={scrollContainerRef} className={tableClasses}>
                <ReactTableHeader table={table} addExtraColumn={addExtraColumn} />

                {shouldShowLoader && loaderType !== 'full' && (
                    <ReactTableLoader
                        table={table}
                        columns={enhancedColumns}
                        addExtraColumn={addExtraColumn}
                    />
                )}

                {shouldShowContent && (
                    <ReactTableBody
                        table={table}
                        columns={enhancedColumns}
                        cellRenderers={cellRenderers}
                        renderDetailPanel={renderDetailPanel}
                        enableRowVirtualization={enableRowVirtualization}
                        addExtraColumn={addExtraColumn}
                        enableRowPolling={enableRowPolling}
                        defaultPollingInterval={defaultPollingInterval}
                        getRowPollingConfig={getRowPollingConfig}
                        updateRowData={updateRowData}
                        enableTablePolling={enableTablePolling}
                        defaultTablePollingInterval={defaultTablePollingInterval}
                    />
                )}

                {shouldShowNoData && <NoData />}

                {showFooter && <ReactTableFooter table={table} addExtraColumn={addExtraColumn} />}

                {sentinelElement}
            </div>
            {isLoadingMore && !hideInfiniteScrollLoader && (
                <div className='infinite-scroll-loading-bar'></div>
            )}
            {enableBottomToolbar && (
                <ReactTableBottomToolbar
                    enablePagination={showPagination}
                    loading={shouldShowLoader}
                    pagination={currentPagination}
                    totalPageCount={
                        paginationType === 'standard'
                            ? totalPageCountForStandardPagination
                            : undefined
                    }
                    onPaginationChange={
                        isManualPaginationHook ? onPaginationChange : handlePaginationChange
                    }
                    bottomToolbarComponent={bottomToolbarComponent}
                    paginationType={paginationType}
                    hasMoreData={hasMoreData}
                />
            )}
        </div>
    );
};

// Wrap ReactTable with ConditionalQueryClientProvider
const ReactTableWithQueryClient = (props: ReactTableProps) => {
    return (
        <ConditionalQueryClientProvider>
            <ReactTable {...props} />
        </ConditionalQueryClientProvider>
    );
};

// Export with preserved types for better TypeScript support
const MemoizedReactTable = memo(ReactTableWithQueryClient) as (
    props: ReactTableProps,
) => React.JSX.Element;
export default MemoizedReactTable;
