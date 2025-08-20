import Button from 'antd/es/button';
import Tooltip from 'antd/es/tooltip';
import './widget-button.less';
import { Table } from '@tanstack/react-table';
import React from 'react';
import classNames from 'classnames';

type WidgetButtonProps = {
    title: string;
    onClick?: () => void;
    icon: React.ReactNode;
    table?: Table<any>;
    size?: 'sm' | 'md' | 'lg';
};

export const WidgetButton = ({ title, icon, onClick, table, size = 'md' }: WidgetButtonProps) => {
    return (
        <Tooltip
            title={title}
            getPopupContainer={table?.options.meta?.getMaskedPopupContainer}
            destroyTooltipOnHide={true}
            autoAdjustOverflow={true}
        >
            <Button
                className={classNames('react-table-widget-trigger', {
                    'react-table-widget-trigger--sm': size === 'sm',
                    'react-table-widget-trigger--md': size === 'md',
                    'react-table-widget-trigger--lg': size === 'lg',
                })}
                onClick={onClick}
                disabled={table?.options.meta?.loading}
            >
                {icon}
            </Button>
        </Tooltip>
    );
};

WidgetButton.displayName = 'WidgetButton';
