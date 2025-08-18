import Button from 'antd/es/button';
import Tooltip from 'antd/es/tooltip';
import './widget-button.less';
import { Table } from '@tanstack/react-table';
import React from 'react';

type WidgetButtonProps = {
    title: string;
    onClick?: () => void;
    icon: React.ReactNode;
    table?: Table<any>;
};

export const WidgetButton = ({ title, icon, onClick, table }: WidgetButtonProps) => {
    return (
        <Tooltip
            title={title}
            getPopupContainer={table?.options.meta?.getMaskedPopupContainer}
            destroyTooltipOnHide={true}
            autoAdjustOverflow={true}
        >
            <Button
                className='react-table-widget-trigger'
                onClick={onClick}
                disabled={table?.options.meta?.loading}
            >
                {icon}
            </Button>
        </Tooltip>
    );
};

WidgetButton.displayName = 'WidgetButton';
