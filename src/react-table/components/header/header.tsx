import { Header, Table, HeaderGroup } from '@tanstack/react-table';

import './header.less';
import { ColGroup } from '../colgroup/colgroup';
import HeaderElement from './header-element';

interface TableProps {
    table: Table<any>;
    addExtraColumn?: boolean;
}

const ReactTableHeaderComponent = ({ table, addExtraColumn }: TableProps) => {
    const headerGroups = table.getHeaderGroups();
    const leftHeaderGroups = table.getLeftHeaderGroups();
    const restHeaderGroups = table.getCenterHeaderGroups();
    const rightHeaderGroups = table.getRightHeaderGroups();

    return (
        <table className='react-table-header'>
            <ColGroup table={table} addExtraColumn={addExtraColumn} />
            <thead>
                {headerGroups.map((headerGroup: HeaderGroup<any>, depth: number) => {
                    const isLeafRow = headerGroups.length - 1 === depth;
                    let cumulativeLeft = 0;
                    let cumulativeRight = 0;
                    const rightHeaders = rightHeaderGroups[depth]?.headers || [];
                    const totalRightStickyWidth = rightHeaders.reduce(
                        (acc, header) => acc + header.getSize(),
                        0,
                    );

                    return (
                        <tr key={headerGroup.id}>
                            {/* Render Left Sticky Headers */}
                            {leftHeaderGroups[depth]?.headers.map(
                                (header: Header<any, unknown>, index: number) => {
                                    const left = cumulativeLeft;
                                    cumulativeLeft += header.getSize();
                                    const isLastLeftSticky =
                                        index === leftHeaderGroups[depth].headers.length - 1;
                                    return (
                                        <HeaderElement
                                            table={table}
                                            key={header.id}
                                            header={header}
                                            type='sticky'
                                            left={left}
                                            isLeafRow={isLeafRow}
                                            isLast={isLastLeftSticky}
                                        />
                                    );
                                },
                            )}

                            {/* Render Center Non-Sticky Headers */}
                            {restHeaderGroups[depth]?.headers.map(
                                (header: Header<any, unknown>, index: number) => {
                                    return (
                                        <HeaderElement
                                            table={table}
                                            key={header.id}
                                            header={header}
                                            type='non-sticky'
                                            isLeafRow={isLeafRow}
                                            isLastColumnBeforeExtraColumn={
                                                addExtraColumn &&
                                                index === restHeaderGroups[depth].headers.length - 1
                                            }
                                        />
                                    );
                                },
                            )}

                            {addExtraColumn && (
                                <th scope='col' className='extra-column-cell'>
                                    <div className='header-cell header-content'>&nbsp;</div>
                                </th>
                            )}

                            {/* Render Right Sticky Headers */}
                            {rightHeaders.map((header: Header<any, unknown>, index: number) => {
                                const right =
                                    totalRightStickyWidth - cumulativeRight - header.getSize();
                                cumulativeRight += header.getSize();
                                const isFirstRightSticky = index === 0;
                                return (
                                    <HeaderElement
                                        table={table}
                                        key={header.id}
                                        header={header}
                                        type='sticky'
                                        right={right}
                                        isLeafRow={isLeafRow}
                                        isFirstRight={isFirstRightSticky}
                                    />
                                );
                            })}
                        </tr>
                    );
                })}
            </thead>
        </table>
    );
};

export default ReactTableHeaderComponent;
