import { Header, Table } from '@tanstack/react-table';
import classNames from 'classnames';
import { PushpinOutlined } from '@ant-design/icons';
import { useCallback, useMemo } from 'react';
import { ColumnPinningType } from '../../../types';

interface PinColElementProps {
    header: Header<any, unknown>;
    table: Table<any>;
}

const PinColElement: React.FC<PinColElementProps> = ({ header, table }) => {
    const canPin = header.column.getCanPin();

    // Early return to prevent unnecessary computations
    if (!canPin) return null;

    const isPinned = header.column.getIsPinned();
    const columnPinningType = useMemo(
        () => (table.options.meta?.columnPinningType as ColumnPinningType | undefined) || 'left',
        [table.options.meta?.columnPinningType],
    );

    const allHeaders = useMemo(() => header.headerGroup.headers, [header.headerGroup.headers]);

    const clickedIndex = header.index;

    // Memoize the expensive computation to determine if this is an unpin trigger
    const isUnpinTrigger = useMemo(() => {
        if (!isPinned) return false;

        if (columnPinningType === 'left' && isPinned === 'left') {
            const leftPinnedColumns = allHeaders.filter((h) => h.column.getIsPinned() === 'left');
            return (
                leftPinnedColumns.length > 0 &&
                leftPinnedColumns[leftPinnedColumns.length - 1].id === header.column.id
            );
        } else if (columnPinningType === 'right' && isPinned === 'right') {
            const rightPinnedColumns = allHeaders.filter((h) => h.column.getIsPinned() === 'right');
            return rightPinnedColumns.length > 0 && rightPinnedColumns[0].id === header.column.id;
        } else if (columnPinningType === 'inplace' && isPinned === 'left') {
            return true;
        } else if (columnPinningType === 'inplace-right' && isPinned === 'right') {
            return true;
        } else if (columnPinningType === 'toggle' && isPinned === 'left') {
            return true;
        }
        return false;
    }, [isPinned, columnPinningType, allHeaders, header.column.id]);

    // Memoize the click handler to prevent recreation on every render
    const handlePinClick = useCallback(() => {
        if (columnPinningType === 'left') {
            if (isUnpinTrigger) {
                allHeaders.forEach((head) => {
                    if (head.column.getIsPinned() === 'left') head.column.pin(false);
                });
            } else {
                allHeaders.forEach((head) => {
                    if (head.index <= clickedIndex) head.column.pin('left');
                    else if (head.column.getIsPinned()) head.column.pin(false);
                });
            }
        } else if (columnPinningType === 'right') {
            if (isUnpinTrigger) {
                allHeaders.forEach((head) => {
                    if (head.column.getIsPinned() === 'right') head.column.pin(false);
                });
            } else {
                allHeaders.forEach((head) => {
                    if (head.index >= clickedIndex) head.column.pin('right');
                    else if (head.column.getIsPinned()) head.column.pin(false);
                });
            }
        } else if (columnPinningType === 'inplace') {
            if (isUnpinTrigger) {
                header.column.pin(false);
            } else {
                header.column.pin('left');
            }
        } else if (columnPinningType === 'inplace-right') {
            if (isUnpinTrigger) {
                header.column.pin(false);
            } else {
                header.column.pin('right');
            }
        } else if (columnPinningType === 'toggle') {
            if (isUnpinTrigger) {
                header.column.pin(false);
            } else {
                header.column.pin('left');
            }
        }
    }, [columnPinningType, isUnpinTrigger, allHeaders, clickedIndex, header.column]);

    // Memoize the onClick handler to prevent recreation
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            handlePinClick();
        },
        [handlePinClick],
    );

    // Memoize the title computation
    const title = useMemo(() => {
        if (isUnpinTrigger) {
            let unpinTitle = 'Unpin column';
            if (columnPinningType === 'left' || columnPinningType === 'right') {
                unpinTitle += 's';
            }
            return unpinTitle;
        } else {
            let pinTitle = 'Pin column';
            if (
                columnPinningType !== 'inplace' &&
                columnPinningType !== 'inplace-right' &&
                columnPinningType !== 'toggle'
            ) {
                pinTitle += 's';
            }
            pinTitle += ` ${columnPinningType === 'inplace-right' ? 'right' : 'left'}`;
            if (columnPinningType === 'toggle') pinTitle = 'Pin column left (toggle)';
            if (columnPinningType === 'left' || columnPinningType === 'right')
                pinTitle = `Pin columns ${columnPinningType}`;
            return pinTitle;
        }
    }, [isUnpinTrigger, columnPinningType]);

    // Memoize the className computation
    const className = useMemo(
        () =>
            classNames('pin-column', {
                'is-unpin-trigger': isUnpinTrigger,
            }),
        [isUnpinTrigger],
    );

    // Memoize the style object to prevent recreation
    const iconStyle = useMemo(
        () => ({
            transform: isPinned
                ? isPinned === 'left'
                    ? 'rotate(45deg)'
                    : 'rotate(-135deg)'
                : 'none',
        }),
        [isPinned],
    );

    return (
        <span className={className} onClick={handleClick} title={title}>
            <PushpinOutlined style={iconStyle} />
        </span>
    );
};

export default PinColElement;
