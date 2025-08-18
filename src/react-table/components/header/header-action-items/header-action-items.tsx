import { Header, Table } from '@tanstack/react-table';

import classNames from 'classnames';
import React, { useDeferredValue, useMemo } from 'react';
import PinColElement from './pin-column';
import SortElement from './sort-column';

interface HeaderActionItemsProps {
    table: Table<any>;
    header: Header<any, unknown>;
    isHovered: boolean;
    deferredIsResizing: boolean;
    isLeafRow: boolean;
}

interface HeaderActionItem {
    id: string;
    element: React.ComponentType<any>;
    getShowItem?: (header: Header<any, unknown>) => boolean;
    getIsActive?: (header: Header<any, unknown>) => boolean;
}

let actionItems: HeaderActionItem[] = [
    {
        id: 'PinColumn',
        element: PinColElement,
        getShowItem: (header: Header<any, unknown>) => {
            return header.column.columnDef.meta?.showPinning ?? true;
        },
        getIsActive: (header: Header<any, unknown>) => {
            return header.column.getIsPinned() !== false;
        },
    },
    {
        id: 'Sort',
        element: SortElement,
        getShowItem: (header: Header<any, unknown>) => {
            return header.column.getCanSort() ?? true;
        },
        getIsActive: (header: Header<any, unknown>) => {
            return header.column.getIsSorted() !== false;
        },
    },
];

const HeaderActionItems = ({ table, header, isHovered }: HeaderActionItemsProps) => {
    return (
        <div className='header-action-buttons'>
            {actionItems.map((item) => (
                <HeaderActionItem
                    key={item.id}
                    item={item}
                    table={table}
                    header={header}
                    isHovered={isHovered}
                />
            ))}
        </div>
    );
};

interface HeaderActionItemProps {
    item: HeaderActionItem;
    table: Table<any>;
    header: Header<any, unknown>;
    isHovered: boolean;
}

const HeaderActionItem = ({ item, table, header, isHovered }: HeaderActionItemProps) => {
    const Element = item.element;
    const isResizing = header.column.getIsResizing();
    const deferredIsResizing = useDeferredValue(isResizing);
    const sortingState = table.getState().sorting;
    const columnPinningState = table.getState().columnPinning;

    // Memoize the show/hide logic to prevent repeated computations
    const showItem = useMemo(() => {
        return item.getShowItem ? item.getShowItem(header) : true;
    }, [item.getShowItem, header]);

    const isActive = useMemo(() => {
        return item.getIsActive ? item.getIsActive(header) : false;
    }, [item.getIsActive, header, sortingState, columnPinningState]);

    // Memoize the className computation
    const className = useMemo(
        () =>
            classNames('header-action-button', {
                'is-hovered': isHovered && !deferredIsResizing,
                'is-active': isActive,
            }),
        [isHovered, deferredIsResizing, isActive],
    );

    if (!showItem) return null;

    return <div className={className}>{Element && <Element header={header} table={table} />}</div>;
};

export default HeaderActionItems;
