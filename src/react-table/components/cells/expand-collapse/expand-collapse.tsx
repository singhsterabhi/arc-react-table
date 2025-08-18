import './expand-collapse.less';
import ArrowIcon from '../../../assets/icons/right-arrow.svg?react';
import { RowData } from '@tanstack/table-core';
import { BaseCellProps } from '../../../types';

export const ExpandCollapseCell = <TData extends RowData, TValue>({
    cell,
}: BaseCellProps<TData, TValue>) => {
    const row = cell.row;
    const isExpanded = row.getIsExpanded();

    // Correctly implement the toggle handler
    const toggleHandler = () => {
        row.toggleExpanded();
    };

    return (
        <div className='expand-collapse-cell' onClick={toggleHandler}>
            <ArrowIcon
                className={`expand-collapse-cell__icon_${isExpanded ? 'expanded' : 'collapsed'}`}
            />
        </div>
    );
};
