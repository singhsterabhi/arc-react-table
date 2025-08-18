import React, { useMemo, useState, useCallback } from 'react';
import Dropdown from 'antd/es/dropdown';
import { MenuProps } from 'antd/es/menu';
import message from 'antd/es/message';
import Tooltip from 'antd/es/tooltip';
import { CopyOutlined } from '@ant-design/icons';
import { CellContextMenuAction, CellContextMenuContext } from '../../../types';
import './cell-context-menu.less';
import classNames from 'classnames';

interface CellContextMenuProps {
    children: React.ReactNode;
    context: CellContextMenuContext;
    actions?: CellContextMenuAction[];
    columnActions?: CellContextMenuAction[];
    containerId?: string;
    enableCopyValue?: boolean;
    props?: any;
}

const checkForFunction = (value: any, data: any) => {
    return typeof value === 'function' ? value(data) : value;
};

export const copyToClipboard = ({
    value,
    showMessage = true,
}: {
    value: any;
    showMessage?: boolean;
}) => {
    const textValue = value != null ? String(value) : '-';

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textValue);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = textValue;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
    }

    if (showMessage) {
        message.success(`Copied to clipboard`);
    }
};

const defaultCopyAction: CellContextMenuAction = {
    key: 'copy-value',
    label: 'Copy',
    group: 'cell',
    icon: <CopyOutlined />,
    onClick: (context: CellContextMenuContext) => {
        const value = context.value;
        copyToClipboard({ value });
    },
};

const menuItemStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '4px 0',
} as const;

const iconStyle = {
    height: '16px',
    width: '16px',
    display: 'flex',
    alignItems: 'center',
} as const;

const majorGroups = ['cell', 'row', 'selection', 'table'] as const;

const dropdownOverlayStyle = { zIndex: 10001 } as const;
const dropdownAlign = { offset: [12, 4] };

const mergeAction = (
    existingActions: CellContextMenuAction[],
    newAction: CellContextMenuAction,
) => {
    const existingIndex = existingActions.findIndex((action) => {
        const isMajorGroup = majorGroups.includes(action.group as any);
        return (
            action.key === newAction.key && (isMajorGroup ? true : action.group === newAction.group)
        );
    });

    if (newAction.visible === false) {
        if (existingIndex !== -1) {
            existingActions.splice(existingIndex, 1);
        }
        return;
    }
    if (existingIndex !== -1) {
        existingActions[existingIndex] = {
            ...existingActions[existingIndex],
            ...newAction,
        };
    } else {
        existingActions.push(newAction);
    }
};

const createMenuItem = (
    actionObj: CellContextMenuAction,
    index: number,
    context: CellContextMenuContext,
    containerId: string,
) => {
    const {
        label,
        icon,
        tooltip,
        disabled,
        onClick,
        getOnClickFunction,
        getDisabledFunction,
        ...action
    } = actionObj;
    const isDisabled = getDisabledFunction
        ? getDisabledFunction(context)()
        : disabled
          ? checkForFunction(disabled, context)
          : false;
    const tooltipText = tooltip ? checkForFunction(tooltip, context) : '';

    return {
        ...action,
        key: action.key || index,
        disabled: isDisabled,
        onClick: () => {
            return getOnClickFunction
                ? getOnClickFunction(context)()
                : onClick
                  ? onClick(context)
                  : null;
        },
        label: (
            <Tooltip
                title={tooltipText}
                zIndex={10002}
                getPopupContainer={() => document.getElementById(containerId) || document.body}
                autoAdjustOverflow={true}
                destroyOnHidden={true}
                placement='left'
            >
                <div style={menuItemStyle}>
                    <span className='icon' style={iconStyle}>
                        {icon || null}
                    </span>
                    <span>{label}</span>
                </div>
            </Tooltip>
        ),
    };
};

export const CellContextMenu: React.FC<CellContextMenuProps> = ({
    children,
    context,
    actions = [],
    columnActions = [],
    containerId = 'react-table-masked-popup-container',
    enableCopyValue = true,
}) => {
    const [contextMenuVisible, setContextMenuVisible] = useState(false);

    const allActions: CellContextMenuAction[] = useMemo(() => {
        const combinedActions: CellContextMenuAction[] = [];

        if (enableCopyValue) {
            combinedActions.push(defaultCopyAction);
        }

        actions.forEach((action) => {
            mergeAction(combinedActions, action);
        });

        columnActions.forEach((action) => {
            mergeAction(combinedActions, action);
        });

        return combinedActions;
    }, [actions, columnActions, enableCopyValue]);

    const menuItems: MenuProps['items'] = useMemo(() => {
        if (!contextMenuVisible || allActions.length === 0) {
            return [];
        }

        const groupedActions = allActions.reduce(
            (groups, action, index) => {
                const group = action.group || 'ungrouped';
                if (!groups[group]) {
                    groups[group] = [];
                }
                groups[group].push({ action, index });
                return groups;
            },
            {} as Record<string, Array<{ action: CellContextMenuAction; index: number }>>,
        );

        const items: MenuProps['items'] = [];

        // Add major groups with dividers
        majorGroups.forEach((groupName) => {
            if (groupedActions[groupName]) {
                const groupItems = groupedActions[groupName].map(({ action, index }) =>
                    createMenuItem(action, index, context, containerId),
                );

                const groupLabel = groupName.charAt(0).toUpperCase() + groupName.slice(1);

                if (groupItems.length > 0) {
                    items.push({
                        key: `group-${groupName}`,
                        type: 'group',
                        label: groupLabel,
                        children: groupItems,
                    });

                    // Add divider after each major group
                    items.push({
                        key: `divider-after-${groupName}`,
                        type: 'divider',
                    });
                }
            }
        });

        // Add other groups with dividers
        Object.keys(groupedActions).forEach((groupName) => {
            if (!majorGroups.includes(groupName as any) && groupName !== 'ungrouped') {
                const groupItems = groupedActions[groupName].map(({ action, index }) =>
                    createMenuItem(action, index, context, containerId),
                );

                if (groupItems.length > 0) {
                    items.push({
                        key: `group-${groupName}`,
                        type: 'group',
                        label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
                        children: groupItems,
                    });

                    // Add divider after each other group
                    items.push({
                        key: `divider-after-${groupName}`,
                        type: 'divider',
                    });
                }
            }
        });

        // Add ungrouped items
        if (groupedActions['ungrouped']) {
            const ungroupedItems = groupedActions['ungrouped'].map(({ action, index }) =>
                createMenuItem(action, index, context, containerId),
            );
            items.push(...ungroupedItems);
        }

        // Remove the last divider if it exists (we don't want a trailing divider)
        if (items.length > 0 && items[items.length - 1]?.type === 'divider') {
            items.pop();
        }

        return items;
    }, [contextMenuVisible, allActions, context, containerId]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 2) {
            e.preventDefault();
        }
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    const getPopupContainer = useCallback(() => {
        return document.getElementById(containerId) || document.body;
    }, [containerId]);

    if (allActions.length === 0) {
        return <>{children}</>;
    }

    return (
        <Dropdown
            overlayStyle={dropdownOverlayStyle}
            autoAdjustOverflow={true}
            getPopupContainer={getPopupContainer}
            destroyOnHidden={true}
            overlayClassName='react-table-masked-popup-container-dropdown react-table-cell-context-menu'
            align={dropdownAlign}
            arrow={false}
            trigger={['contextMenu']}
            menu={{ items: menuItems }}
            placement='bottomLeft'
            open={contextMenuVisible}
            onOpenChange={setContextMenuVisible}
        >
            <div
                title='Right click for more options'
                className={classNames('cell-context-menu', {
                    'cell-context-menu-visible': contextMenuVisible,
                })}
                onMouseDown={handleMouseDown}
                onContextMenu={handleContextMenu}
            >
                {children}
            </div>
        </Dropdown>
    );
};
