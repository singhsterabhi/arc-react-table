import React, { useCallback, useMemo, useEffect, useRef, CSSProperties } from 'react';
import { ColumnDef, Table } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableContent } from './table-content';
import './body.less';
import { RenderDetailPanelProps, GetRowPollingConfig, UpdateRowData } from '../../types';
import { throttle } from 'lodash-es';

interface BodyElementProps {
    table: Table<any>;
    columns: ColumnDef<any>[];
    cellRenderers?: Record<string, (props: any) => React.ReactNode>;
    renderDetailPanel?: (props: RenderDetailPanelProps) => React.ReactNode;
    enableRowVirtualization?: boolean;
    addExtraColumn?: boolean;
    enableRowPolling?: boolean;
    defaultPollingInterval?: number;
    getRowPollingConfig?: GetRowPollingConfig;
    updateRowData?: UpdateRowData;
    enableTablePolling?: boolean;
    defaultTablePollingInterval?: number;
}

const ReactTableBody = (props: BodyElementProps) => {
    let enableRowVirtualization = props.enableRowVirtualization;

    if (!enableRowVirtualization) {
        return <ReactTableBodyNoVirtualized {...props} />;
    }

    return <ReactTableBodyVirtualized {...props} />;
};

const ReactTableBodyNoVirtualized = ({
    table,
    columns,
    cellRenderers,
    renderDetailPanel,
    addExtraColumn,
    enableRowPolling,
    defaultPollingInterval,
    getRowPollingConfig,
    updateRowData,
    enableTablePolling,
    defaultTablePollingInterval,
}: BodyElementProps) => {
    return (
        <TableContent
            table={table}
            columns={columns}
            cellRenderers={cellRenderers}
            renderDetailPanel={renderDetailPanel}
            addExtraColumn={addExtraColumn}
            enableRowPolling={enableRowPolling}
            defaultPollingInterval={defaultPollingInterval}
            getRowPollingConfig={getRowPollingConfig}
            updateRowData={updateRowData}
            enableTablePolling={enableTablePolling}
            defaultTablePollingInterval={defaultTablePollingInterval}
        />
    );
};

const ROW_HEIGHT = 40;
// Lower overscan for improved performance
const OVERSCAN = 3;

const ReactTableBodyVirtualized = ({
    table,
    columns,
    cellRenderers,
    renderDetailPanel,
    addExtraColumn,
    enableRowPolling,
    defaultPollingInterval,
    getRowPollingConfig,
    updateRowData,
    enableTablePolling,
    defaultTablePollingInterval,
}: BodyElementProps) => {
    // For virtualized table
    const { rows } = table.getRowModel();
    const rowsCount = rows.length;

    // Simple, performant key generation
    const getItemKey = useCallback(
        (index: number) => {
            // Access current rows to avoid stale closures while keeping stable dependency
            const currentRows = table.getRowModel().rows;
            const row = currentRows[index];
            return row?.id ?? `row-${index}`;
        },
        [table],
    );
    const tableRowHeight = table?.options.meta?.rowHeight;
    const rowHeight = useMemo(() => tableRowHeight ?? ROW_HEIGHT, [tableRowHeight]);

    const scrollContainerRef = table?.options.meta?.scrollContainerRef;
    const rafIdRef = useRef<number | null>(null);

    // Memoize the scroll element getter
    const getScrollElement = useCallback(
        () => scrollContainerRef?.current ?? null,
        [scrollContainerRef],
    );

    const estimateSize = useCallback(() => rowHeight, [rowHeight]);

    const virtualizer = useVirtualizer({
        count: rowsCount,
        getScrollElement,
        estimateSize,
        overscan: OVERSCAN,
        getItemKey,
        // Optimize for performance
        useAnimationFrameWithResizeObserver: false,
    });

    // Use requestAnimationFrame to optimize scroll handling
    useEffect(() => {
        const scrollElement = getScrollElement();
        if (!scrollElement) return;

        // Efficient scroll handler with throttling and RAF
        const handleScroll = throttle(() => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }

            rafIdRef.current = requestAnimationFrame(() => {
                virtualizer.measure();
                rafIdRef.current = null;
            });
        }, 50);

        // Use passive option to tell browser we won't call preventDefault
        scrollElement.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            scrollElement.removeEventListener('scroll', handleScroll);
            handleScroll.cancel();

            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [virtualizer, getScrollElement]);

    // Memoize expensive calculations for virtual rows
    const virtualRows = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();

    const virtualizedContainerStyle = useMemo(
        (): CSSProperties => ({
            height: `${totalSize + 1}px`,
            position: 'relative',
            width: '100%',
        }),
        [totalSize],
    );

    const virtualizedContentStyle = useMemo((): CSSProperties => {
        const offsetY = virtualRows.length > 0 ? virtualRows[0].start : 0;
        return {
            transform: `translate3d(0, ${offsetY}px, 0)`,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
        };
    }, [virtualRows]);

    return (
        <div className='virtualized-container' style={virtualizedContainerStyle}>
            <div className='virtualized-content' style={virtualizedContentStyle}>
                <TableContent
                    table={table}
                    columns={columns}
                    cellRenderers={cellRenderers}
                    renderDetailPanel={renderDetailPanel}
                    virtualRows={virtualRows}
                    measureElement={virtualizer.measureElement}
                    addExtraColumn={addExtraColumn}
                    enableRowPolling={enableRowPolling}
                    defaultPollingInterval={defaultPollingInterval}
                    getRowPollingConfig={getRowPollingConfig}
                    updateRowData={updateRowData}
                    enableTablePolling={enableTablePolling}
                    defaultTablePollingInterval={defaultTablePollingInterval}
                />
            </div>
        </div>
    );
};

export default ReactTableBody;
