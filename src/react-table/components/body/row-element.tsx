import { Row, Cell as TanCell } from '@tanstack/react-table';
import { Cell } from './cell';
import { useMemo, memo } from 'react';

interface RowElementProps {
    row: Row<any>;
    virtualRow: any;
    addExtraColumn: boolean;
}

export const RowElement = ({ row, virtualRow, addExtraColumn }: RowElementProps) => {
    const leftCells = row.getLeftVisibleCells();
    const centerCells = row.getCenterVisibleCells();
    const rightCells = row.getRightVisibleCells();

    let cumulativeLeft = 0;
    let cumulativeRight = 0;

    // Calculate total width of right sticky cells for offset calculation
    const totalRightStickyWidth = useMemo(
        () => rightCells.reduce((acc, cell) => acc + cell.column.getSize(), 0),
        [rightCells],
    );

    return (
        <>
            {/* Render Left Sticky Cells */}
            {leftCells.map((cell: TanCell<any, unknown>, index: number) => {
                const left = cumulativeLeft;
                cumulativeLeft += cell.column.getSize();
                const key = typeof cell.id === 'object' ? JSON.stringify(cell.id) : cell.id;

                return (
                    <Cell
                        key={key}
                        cell={cell}
                        left={left}
                        isLast={index === leftCells.length - 1}
                    />
                );
            })}

            {/* Render Center Non-Sticky Cells */}
            {centerCells.map((cell: TanCell<any, unknown>, index: number) => {
                const key = typeof cell.id === 'object' ? JSON.stringify(cell.id) : cell.id;
                return (
                    <Cell
                        key={key}
                        cell={cell}
                        isLastColumnBeforeExtraColumn={
                            addExtraColumn && index === centerCells.length - 1
                        }
                    />
                );
            })}
            {addExtraColumn && <RowExtraColumn size={virtualRow.size} />}

            {/* Render Right Sticky Cells */}
            {rightCells.map((cell: TanCell<any, unknown>, index: number) => {
                // Calculate right offset from the right edge
                const right = totalRightStickyWidth - cumulativeRight - cell.column.getSize();
                cumulativeRight += cell.column.getSize();
                const key = typeof cell.id === 'object' ? JSON.stringify(cell.id) : cell.id;
                // Pass the calculated right style to the Cell component
                return <Cell key={key} cell={cell} right={right} isFirstRight={index === 0} />;
            })}
        </>
    );
};

// Memoize the RowExtraColumn to prevent unnecessary re-renders
const RowExtraColumn = memo(({ size }: { size: number }) => {
    return (
        <td style={{ height: size }} className='extra-column-cell' scope='col'>
            <div className='cell'>&nbsp;</div>
        </td>
    );
});

RowElement.displayName = 'RowElement';
