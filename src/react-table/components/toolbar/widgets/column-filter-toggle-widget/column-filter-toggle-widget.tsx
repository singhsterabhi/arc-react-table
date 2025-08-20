import './column-filter-toggle-widget.less';
import ColumnsFilterToggleOnIcon from '../../../../assets/icons/filters-on.svg?react';
import ColumnsFilterToggleOffIcon from '../../../../assets/icons/filters-off.svg?react';
import { Table } from '@tanstack/react-table';
import { WidgetButton } from '../widget-button/widget-button';
import { useCallback, useMemo } from 'react';

export const ColumnFilterToggleWidget = ({
    table,
    widgetButtonSize = 'md',
}: {
    table: Table<any>;
    widgetButtonSize?: 'sm' | 'md' | 'lg';
}) => {
    const handleToggleFilters = useCallback(() => {
        table.options.meta?.toggleFilters?.();
    }, [table.options.meta]);

    const iconNode = useMemo(() => {
        return table.options.meta?.filtersEnabled ? (
            <ColumnsFilterToggleOffIcon />
        ) : (
            <ColumnsFilterToggleOnIcon />
        );
    }, [table.options.meta?.filtersEnabled]);

    return (
        <WidgetButton
            table={table}
            title={table.options.meta?.filtersEnabled ? 'Disable Filters' : 'Enable Filters'}
            icon={iconNode}
            onClick={handleToggleFilters}
            size={widgetButtonSize}
        />
    );
};
