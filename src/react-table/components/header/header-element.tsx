import { useDeferredValue, useState, useCallback, useMemo } from 'react';
import { Header, Table } from '@tanstack/react-table';
import classNames from 'classnames';
import { flexRender } from '@tanstack/react-table';
import HeaderActionItems from './header-action-items/header-action-items';
import { getCommonPinningStyles } from '../utils';
import { getCommonPinnedClassNames } from '../utils';
import Typography from 'antd/es/typography';
import { HeaderFilterComponent } from './header-filter/header-filter';

interface HeaderElementProps {
    header: Header<any, unknown>;
    table: Table<any>;
    type: string;
    left?: number;
    right?: number;
    isLeafRow: boolean;
    isLast?: boolean;
    isFirstRight?: boolean;
    isLastColumnBeforeExtraColumn?: boolean;
}

const HeaderElement = ({
    header,
    table,
    type,
    left,
    right,
    isLeafRow,
    isLast,
    isFirstRight,
    isLastColumnBeforeExtraColumn,
}: HeaderElementProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const isResizing = header.column.getIsResizing();
    const deferredIsResizing = useDeferredValue(isResizing);
    const showHeaderActionItems = header.column.columnDef.meta?.showHeaderActionItems ?? true;
    let sortingHandler = header.column.getToggleSortingHandler();

    const handleHeaderContentClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            if (!deferredIsResizing && !header.isPlaceholder && sortingHandler) {
                sortingHandler(e);
            }
        },
        [deferredIsResizing, header.isPlaceholder, sortingHandler],
    );

    const handleResizerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }, []);

    const handleResizerDoubleClick = useCallback(() => {
        header.column.resetSize();
    }, [header.column]);

    const thStyle = useMemo(
        () => ({
            left,
            right,
            ...getCommonPinningStyles(header.column),
        }),
        [left, right, header.column],
    );

    const getPopupContainer = useMemo(
        () => table?.options.meta?.getMaskedPopupContainer,
        [table?.options.meta?.getMaskedPopupContainer],
    );

    const ellipsisConfig = useMemo(
        () => ({
            tooltip: {
                title: String(header.column.columnDef.header),
                destroyTooltipOnHide: true,
                getPopupContainer: getPopupContainer,
            },
        }),
        [header.column.columnDef.header, getPopupContainer],
    );

    return (
        <th
            id={header.id}
            scope='col'
            className={classNames(
                type === 'sticky' ? 'sticky-cell' : '',
                isLast ? 'show-shadow-left' : '',
                isFirstRight ? 'show-shadow-right' : '',
                getCommonPinnedClassNames(header.column),
                isLastColumnBeforeExtraColumn ? 'last-column-before-extra-column' : '',
            )}
            colSpan={header.colSpan}
            style={thStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={classNames('header-cell header-content', {
                    'cursor-pointer select-none':
                        header.column.getCanSort() && !header.isPlaceholder,
                })}
            >
                {header.isPlaceholder ? (
                    <div className='table-header'>
                        &nbsp;
                        <div className='border-right' />
                    </div>
                ) : header.column.columnDef.header ? (
                    <div className='table-header' onClick={handleHeaderContentClick}>
                        <div className='header-top'>
                            <div
                                className={classNames('header-name', {
                                    'header-name-with-action-items': showHeaderActionItems,
                                })}
                            >
                                {typeof header.column.columnDef.header === 'string' ? (
                                    <Typography.Text
                                        className='header-name-text'
                                        ellipsis={ellipsisConfig}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Typography.Text>
                                ) : (
                                    flexRender(header.column.columnDef.header, header.getContext())
                                )}
                            </div>
                            {showHeaderActionItems && (
                                <HeaderActionItems
                                    table={table}
                                    header={header}
                                    isHovered={isHovered}
                                    deferredIsResizing={deferredIsResizing}
                                    isLeafRow={isLeafRow}
                                />
                            )}
                            {header.column.getCanResize() && (
                                <div
                                    onClick={handleResizerClick}
                                    onDoubleClick={handleResizerDoubleClick}
                                    onMouseDown={header.getResizeHandler()}
                                    onTouchStart={header.getResizeHandler()}
                                    className={`resizer ${isResizing ? 'isResizing' : ''} ${isHovered ? 'isHovered' : ''}`}
                                />
                            )}
                        </div>
                        <HeaderFilterComponent header={header} table={table} />
                    </div>
                ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                )}
            </div>
        </th>
    );
};

export default HeaderElement;
