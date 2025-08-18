import React, { useMemo, useRef, useState } from 'react';
import { Table, Column } from '@tanstack/react-table';
import Switch from 'antd/es/switch';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Tooltip from 'antd/es/tooltip';
import Typography from 'antd/es/typography';
import {
    // EyeOutlined,
    // EyeInvisibleOutlined,
    PushpinOutlined,
    HolderOutlined,
} from '@ant-design/icons'; // Assuming we'll use these icons
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    restrictToVerticalAxis,
    restrictToWindowEdges,
    restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import './column-menu.less'; // We'll create this file next

const { Text } = Typography;

interface ColumnMenuProps {
    table: Table<any>;
}

// --- Sortable Item Component ---
interface SortableColumnItemProps {
    column: Column<any>;
    renderItem: (column: Column<any>, listeners?: any, attributes?: any) => React.ReactNode;
    isDraggingAny: boolean;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({ column, renderItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 10 : 'auto', // Ensure dragging item is on top
        cursor: 'grab', // Indicate draggable
    };

    // Pass listeners and attributes to the renderItem function
    return (
        <div ref={setNodeRef} style={style}>
            {renderItem(column, listeners, attributes)}
        </div>
    );
};

export const ColumnMenu: React.FC<ColumnMenuProps> = ({ table }) => {
    const {
        getAllLeafColumns,
        // getVisibleLeafColumns,
        resetColumnOrder,
        // setColumnOrder, // Added for dnd
        getState, // Added for dnd
    } = table;

    // Add refs for scrolling effects
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollDivRef = useRef<HTMLDivElement>(null);

    // Track if any item is being dragged
    const [isDraggingAny, setIsDraggingAny] = useState(false);

    // Get current column order for dnd context
    const { columnOrder } = getState();
    const allColumns = getAllLeafColumns();
    // const visibleColumns = getVisibleLeafColumns();

    // Memoize columns based on the current order for SortableContext
    const orderedColumns = useMemo(() => {
        // const allCols = getAllLeafColumns(); // Redundant: allColumns is already available from component scope
        const currentColumnOrder = table.getState().columnOrder; // Get latest order state for comparison

        if (currentColumnOrder.length === 0) {
            return allColumns; // Use allColumns from component scope
        }

        const ordered = [...allColumns]; // Create a mutable copy of all columns from component scope

        // Sort the copied array
        ordered.sort((a, b) => {
            const indexA = currentColumnOrder.indexOf(a.id);
            const indexB = currentColumnOrder.indexOf(b.id);

            // If both columns are in the state order, sort by their index in the state order
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is in the state order, A comes first
            if (indexA !== -1) return -1;
            // If only B is in the state order, B comes first
            if (indexB !== -1) return 1;
            // If neither is in the state order, maintain original relative order (implicit via stable sort, or return 0)
            return 0;
        });

        return ordered;
    }, [allColumns, columnOrder]); // Depend on allColumns reference and the columnOrder value from state
    // console.log('orderedColumns', orderedColumns);
    // console.log('columnOrder', columnOrder);
    const columnIds = useMemo(() => orderedColumns.map((col) => col.id), [orderedColumns]);

    // --- Sensors for dnd-kit ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Require a minimum drag distance to activate
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // --- Drag Start Handler ---
    const handleDragStart = () => {
        setIsDraggingAny(true);
    };

    // --- Drag End Handler ---
    const handleDragEnd = (event: DragEndEvent) => {
        setIsDraggingAny(false);

        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = columnIds.indexOf(active.id as string);
            const newIndex = columnIds.indexOf(over.id as string);
            const newOrder = arrayMove(columnIds, oldIndex, newIndex);
            // Filter out internal columns before setting order
            const settableOrder = newOrder.filter(
                (id) => !['react-table-row-select', 'react-table-row-expand'].includes(id),
            );
            table.setColumnOrder(settableOrder);
        }
    };

    // --- Action Handlers ---
    const handleToggleVisibility = (column: Column<any>) => {
        column.toggleVisibility(!column.getIsVisible());
    };

    const handlePinColumn = (column: Column<any>, side: 'left' | 'right' | false) => {
        // Placeholder for pinning logic
        console.log(`Pinning column ${column.id} to ${side}`);
        // Example: table.setColumnPinning({ left: [...], right: [...] });
        column.pin(side);
    };

    const handleShowAll = () => {
        allColumns.forEach((col) => col.toggleVisibility(true));
    };

    const handleHideAll = () => {
        // Keep essential columns visible if needed (e.g., row selection/expansion)
        const essentialColumnIds = ['react-table-row-select', 'react-table-row-expand'];
        allColumns.forEach((col) => {
            if (!essentialColumnIds.includes(col.id) && !col.getIsPinned()) {
                // Avoid hiding pinned or essential cols initially
                col.toggleVisibility(false);
            }
        });
    };

    const handleResetOrder = () => {
        resetColumnOrder();
    };

    // --- Render Logic ---
    const renderColumnItem = (column: Column<any>, listeners?: any, attributes?: any) => {
        // Don't show controls for selection/expansion columns
        if (['react-table-row-select', 'react-table-row-expand'].includes(column.id)) {
            return null;
        }

        const isVisible = column.getIsVisible();
        const isPinned = column.getIsPinned();

        return (
            <div key={column.id} className='column-menu-item'>
                <Space>
                    {/* Placeholder for Drag Handle */}
                    <Tooltip title='Drag to reorder' open={isDraggingAny ? false : undefined}>
                        <Button
                            type='text'
                            icon={<HolderOutlined />}
                            size='small'
                            className='drag-handle'
                            {...attributes} // Spread dnd attributes
                            {...listeners} // Spread dnd listeners
                            style={{ cursor: 'grab' }} // Explicitly set grab cursor
                            disabled={!!isPinned} // Disable dragging for pinned columns for simplicity
                        />
                    </Tooltip>
                    <Switch
                        checked={isVisible}
                        onChange={() => handleToggleVisibility(column)}
                        size='small'
                        disabled={!column.getCanHide() || !!isPinned} // Prevent hiding pinned columns via toggle for now
                    />
                    <Text className='column-name'>
                        {column.columnDef.header?.toString() || column.id}
                    </Text>
                </Space>
                <Space>
                    {/* Pinning Controls Placeholder */}
                    <Tooltip
                        title={`Pin ${isPinned === 'left' ? 'right' : 'left'}`}
                        open={isDraggingAny ? false : undefined}
                    >
                        <Button
                            type={isPinned === 'left' ? 'primary' : 'text'}
                            icon={<PushpinOutlined style={{ transform: 'rotate(-90deg)' }} />}
                            size='small'
                            onClick={() =>
                                handlePinColumn(column, isPinned === 'left' ? false : 'left')
                            }
                        />
                    </Tooltip>
                    <Tooltip
                        title={`Pin ${isPinned === 'right' ? 'left' : 'right'}`}
                        open={isDraggingAny ? false : undefined}
                    >
                        <Button
                            type={isPinned === 'right' ? 'primary' : 'text'}
                            icon={<PushpinOutlined style={{ transform: 'rotate(90deg)' }} />}
                            size='small'
                            onClick={() =>
                                handlePinColumn(column, isPinned === 'right' ? false : 'right')
                            }
                        />
                    </Tooltip>
                </Space>
            </div>
        );
    };

    return (
        <div className='column-menu-container' ref={containerRef}>
            <div className='column-menu-header'>
                <Button onClick={handleHideAll} size='small'>
                    Hide all
                </Button>
                <Button onClick={handleResetOrder} size='small'>
                    Reset order
                </Button>
                <Button onClick={handleShowAll} size='small'>
                    Show all
                </Button>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[
                    restrictToVerticalAxis,
                    restrictToWindowEdges,
                    restrictToFirstScrollableAncestor,
                ]}
            >
                <SortableContext
                    items={columnIds} // Use memoized IDs
                    strategy={verticalListSortingStrategy}
                >
                    <div className='column-menu-list' ref={scrollDivRef}>
                        {/* Map over ordered columns and use SortableColumnItem */}
                        {orderedColumns.map((col) =>
                            // Render internal columns normally, sortable ones with the wrapper
                            ['react-table-row-select', 'react-table-row-expand'].includes(
                                col.id,
                            ) ? (
                                renderColumnItem(col) // Render directly if not draggable
                            ) : (
                                <SortableColumnItem
                                    key={col.id}
                                    column={col}
                                    renderItem={renderColumnItem}
                                    isDraggingAny={isDraggingAny}
                                />
                            ),
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
