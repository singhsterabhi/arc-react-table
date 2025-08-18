import { flexRender, Header, Table } from '@tanstack/react-table';
import './footer.less';
import { ColGroup } from '../colgroup/colgroup';
import { getCommonPinnedClassNames, getCommonPinningStyles } from '../utils';

function ReactTableFooter({
    table,
    addExtraColumn,
}: {
    table: Table<any>;
    addExtraColumn?: boolean;
}) {
    // Use leaf headers for consistency with ColGroup and body
    const leftHeaders = table.getLeftLeafHeaders();
    const centerHeaders = table.getCenterLeafHeaders();
    const rightHeaders = table.getRightLeafHeaders();

    // Check if there's any footer content defined at all
    const hasFooter = [...leftHeaders, ...centerHeaders, ...rightHeaders].some(
        (header) => header.column.columnDef.footer,
    );

    if (!hasFooter) {
        return null; // Don't render footer if no content
    }

    let cumulativeLeft = 0;
    let cumulativeRight = 0;
    const totalRightStickyWidth = rightHeaders.reduce((acc, header) => acc + header.getSize(), 0);

    return (
        <table className='react-table-footer'>
            <ColGroup table={table} addExtraColumn={addExtraColumn} />
            <tfoot>
                <tr>
                    {/* Left Pinned Footers */}
                    {leftHeaders.map((header: Header<any, unknown>, index: number) => {
                        const left = cumulativeLeft;
                        cumulativeLeft += header.getSize();
                        const isLastLeftSticky = index === leftHeaders.length - 1;
                        return (
                            <th
                                key={header.id}
                                style={{ left: `${left}px` }}
                                className={isLastLeftSticky ? 'show-shadow-left' : ''}
                            >
                                <div
                                    className={`footer-cell footer-content ${getCommonPinnedClassNames(header.column)}`}
                                    style={getCommonPinningStyles(header.column)}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.footer,
                                              header.getContext(),
                                          )}
                                </div>
                            </th>
                        );
                    })}
                    {/* Center Non-Pinned Footers */}
                    {centerHeaders.map((header: Header<any, unknown>, index: number) => {
                        return (
                            <th
                                key={header.id}
                                className={
                                    addExtraColumn && index === centerHeaders.length - 1
                                        ? 'last-column-before-extra-column'
                                        : ''
                                }
                            >
                                <div
                                    className={`footer-cell footer-content ${getCommonPinnedClassNames(header.column)}`}
                                    style={getCommonPinningStyles(header.column)}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.footer,
                                              header.getContext(),
                                          )}
                                </div>
                            </th>
                        );
                    })}
                    {addExtraColumn && (
                        <th scope='col' style={{ width: '100%' }} className='extra-column-cell'>
                            <div className={`footer-cell footer-content`}>&nbsp;</div>
                        </th>
                    )}
                    {/* Right Pinned Footers */}
                    {rightHeaders.map((header: Header<any, unknown>, index: number) => {
                        const right = totalRightStickyWidth - cumulativeRight - header.getSize();
                        cumulativeRight += header.getSize();
                        const isFirstRightSticky = index === 0;
                        return (
                            <th
                                key={header.id}
                                style={{ right: `${right}px` }}
                                className={isFirstRightSticky ? 'show-shadow-right' : ''}
                            >
                                <div
                                    className={`footer-cell footer-content ${getCommonPinnedClassNames(header.column)}`}
                                    style={getCommonPinningStyles(header.column)}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.footer,
                                              header.getContext(),
                                          )}
                                </div>
                            </th>
                        );
                    })}
                </tr>
            </tfoot>
        </table>
    );
}

export default ReactTableFooter;
