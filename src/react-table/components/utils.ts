import { Column, ColumnDef } from '@tanstack/react-table';
import { CSSProperties } from 'react';

export const getCustomRendererColSpan = (columns: ColumnDef<any>[]) => {
    let getColSpan = (columns: ColumnDef<any>[]) => {
        let cols = 0;

        columns.forEach((col: any) => {
            if (col.columns?.length) cols += getColSpan(col.columns);
            else cols++;
        });
        return cols;
    };

    return getColSpan(columns);
};

export const getRowBackgroundColor = (level: number): string => {
    // Validate input
    if (level < 0 || level > 20) {
        throw new Error('Level must be between 0 and 20');
    }

    // Calculate darkness based on level (0 = white, 20 = darkest)
    const darkness = Math.min(level * 5, 100); // Adjust factor (5) for desired darkness progression

    // Convert darkness to a valid RGB value
    const rgb = `rgb(${255 - darkness}, ${255 - darkness}, ${255 - darkness})`;

    return rgb;
};

export const getCommonPinningStyles = (column: Column<any, unknown>): CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLeftPinned = isPinned === 'left';

    // Parent component should calculate and provide the correct 'right' offset style.
    // We only calculate left here.

    return {
        left: isLeftPinned ? `${column.getStart('left')}px` : undefined,
        position: isPinned ? 'sticky' : 'relative',
        zIndex: isPinned ? 1 : 0,
        width: column.getSize(),
    };
};

export const getCommonPinnedClassNames = (column: Column<any>) => {
    const isPinned = column.getIsPinned();

    const stickyClass = isPinned ? ' sticky-cell ' : '';
    const leftShadowClass = isPinned === 'left' && column.getIsLastColumn('left');
    const rightShadowClass = isPinned === 'right' && column.getIsFirstColumn('right');

    return (
        stickyClass +
        (leftShadowClass ? ' left-shadow ' : '') +
        (rightShadowClass ? ' right-shadow ' : '')
    );
};

export function isNullOrUndefinedOrEmpty(value: any) {
    return value === undefined || value === null || value === '';
}

export function isNullOrUndefined(value: any) {
    return value === undefined || value === null;
}
