import { RowData } from '@tanstack/react-table';
import classNames from 'classnames';
import { useCallback } from 'react';
import { BaseHeaderProps } from '../../../types';
import RightArrow from '../../../assets/icons/right-arrow.svg?react';

export const ExpandAllHeader = <TData extends RowData, TValue>({
    table,
}: BaseHeaderProps<TData, TValue>) => {
    const canExpand = table.getCanSomeRowsExpand();
    const isAllExpanded = table.getIsAllRowsExpanded();

    if (!canExpand) {
        return null;
    }

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent sorting
            table.toggleAllRowsExpanded(!isAllExpanded);
        },
        [table, isAllExpanded],
    );

    return (
        <div onClick={handleClick} className='react-table-expand-cell'>
            <RightArrow
                className={classNames(
                    'react-table-expand-icon',
                    isAllExpanded ? 'expanded' : 'collapsed',
                )}
            />
        </div>
    );
};
