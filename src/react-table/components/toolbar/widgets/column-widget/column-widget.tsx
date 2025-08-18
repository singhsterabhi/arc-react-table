import Popover from 'antd/es/popover';
import { ColumnMenu } from '../../../column-menu/column-menu';
import { Table } from '@tanstack/react-table';
import ColumnsIcon from '../../../../assets/icons/column_setting.svg?react';
import './column-widget.less';
import { WidgetButton } from '../widget-button/widget-button';
import { useCallback, useMemo } from 'react';

export interface ColumnWidgetProps {
    table: Table<any>;
}

const classNames = {
    root: 'react-table-column-menu-popup',
};

const styles = {
    root: {
        zIndex: 101,
    },
};

export const ColumnWidget = ({ table }: ColumnWidgetProps) => {
    const content = useCallback(() => {
        return <ColumnMenu table={table} />;
    }, [table]);

    const stableColumnsIcon = useMemo(() => <ColumnsIcon />, []);

    const button = useMemo(() => {
        return <WidgetButton table={table} title='Column Settings' icon={stableColumnsIcon} />;
    }, [table, stableColumnsIcon]);

    const getPopupContainer = useCallback(() => {
        return document.getElementById('masked-popup-container') as HTMLElement;
    }, []);

    return (
        <Popover
            content={content}
            trigger='click'
            placement='bottomRight'
            arrow={false}
            destroyTooltipOnHide={true}
            classNames={classNames}
            styles={styles}
            // Optional: Use this if popover needs to render within a specific masked container
            getPopupContainer={getPopupContainer}
            autoAdjustOverflow={true}
        >
            {button}
        </Popover>
    );
};
