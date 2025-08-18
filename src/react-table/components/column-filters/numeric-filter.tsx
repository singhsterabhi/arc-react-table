import React, { useCallback, useMemo, useState } from 'react';
import Menu from 'antd/es/menu';
import Popover from 'antd/es/popover';
import Input from 'antd/es/input';
import { Column, FilterFn, Table } from '@tanstack/react-table';
import './numeric-filter.less';
import { convertToPercent, forceDecimalPlaces } from '../../utils';

const classNames = {
    root: 'custom-react-table-numeric-filter-popover',
    body: 'custom-react-table-numeric-filter-popover-content',
};
const GreaterThanOutlined = () => (
    <span className='custom-react-table-numeric-filter-icon greater-than'>{'>'}</span>
);

const LessThanOutlined = () => (
    <span className='custom-react-table-numeric-filter-icon less-than'>{'<'}</span>
);
const ContainsOutlined = () => (
    <span className='custom-react-table-numeric-filter-icon contains'>*</span>
);
const EqualsOutlined = () => (
    <span className='custom-react-table-numeric-filter-icon equals'>{'='}</span>
);

type FilterMode = 'greaterThan' | 'lessThan' | 'contains' | 'equals';

type NumericFilterProps = {
    Filter: (props: { column?: Column<any, any>; table?: Table<any> }) => React.JSX.Element;
    filterFn: FilterFn<any>;
};
interface InputPrefixProps {
    column: Column<any, any>;
    filterValue: string;
    setFilterMode: React.Dispatch<React.SetStateAction<FilterMode>>;
    filterMode: FilterMode;
}

const InputPrefix = ({ column, filterValue, setFilterMode, filterMode }: InputPrefixProps) => {
    const [open, setOpen] = useState(false);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
    }, []);

    const handleFilterModeChange = useCallback(
        (mode: FilterMode) => {
            setFilterMode(mode);
            setOpen(false);

            // Apply the filter with the current value and new mode
            if (filterValue) {
                column.setFilterValue({ mode, value: filterValue });
            }
        },
        [column, filterValue],
    );

    const onClick = useCallback(
        ({ key }: { key: string }) => handleFilterModeChange(key as FilterMode),
        [handleFilterModeChange],
    );

    const onMouseLeave = useCallback(() => {
        setOpen(false);
    }, []);

    const content = useMemo(
        () => (
            <Menu
                // onMouseLeave={onMouseLeave}
                mode='vertical'
                className='custom-react-table-numeric-filter-menu'
                onClick={onClick}
                selectable
                selectedKeys={[filterMode]}
            >
                <Menu.Item key='equals' className='custom-react-table-numeric-filter-menu-item'>
                    <div className='custom-react-table-numeric-filter-menu-item-content'>
                        <EqualsOutlined />
                        <span>Equals</span>
                    </div>
                </Menu.Item>
                <Menu.Item
                    key='greaterThan'
                    className='custom-react-table-numeric-filter-menu-item'
                >
                    <div className='custom-react-table-numeric-filter-menu-item-content'>
                        <GreaterThanOutlined />
                        <span>Greater Than</span>
                    </div>
                </Menu.Item>
                <Menu.Item key='lessThan' className='custom-react-table-numeric-filter-menu-item'>
                    <div className='custom-react-table-numeric-filter-menu-item-content'>
                        <LessThanOutlined />
                        <span>Less Than</span>
                    </div>
                </Menu.Item>
                <Menu.Item key='contains' className='custom-react-table-numeric-filter-menu-item'>
                    <div className='custom-react-table-numeric-filter-menu-item-content'>
                        <ContainsOutlined />
                        <span>Contains</span>
                    </div>
                </Menu.Item>
            </Menu>
        ),
        [filterMode, onClick, onMouseLeave],
    );

    const getFilterModeIcon = useCallback(() => {
        switch (filterMode) {
            case 'greaterThan':
                return <GreaterThanOutlined />;
            case 'lessThan':
                return <LessThanOutlined />;
            case 'contains':
                return <ContainsOutlined />;
            case 'equals':
                return <EqualsOutlined />;
            default:
                return <ContainsOutlined />;
        }
    }, [filterMode]);

    return (
        <Popover
            content={content}
            trigger='click'
            open={open}
            onOpenChange={handleOpenChange}
            placement='bottomLeft'
            classNames={classNames}
            arrow={false}
        >
            <div className='custom-react-table-numeric-filter-icon-container'>
                {getFilterModeIcon()}
            </div>
        </Popover>
    );
};

export const NumericFilter = (type?: string): NumericFilterProps => {
    const removeComma = (numStr: string) => {
        if (numStr.includes('.')) {
            const parts = numStr.split('.');
            const decimals = parts[1].length || 0;
            return parseFloat(numStr.replace(/,/g, '')).toFixed(decimals);
        }
        return numStr.replace(/,/g, '');
    };
    const getFormatterCellValue = (value: any) => {
        switch (type) {
            case 'KM':
                return value;
            case 'Percentage':
                return convertToPercent(value);
            case 'Currency':
                return removeComma(forceDecimalPlaces(value, 2).value);
            default:
                return value;
        }
    };

    return {
        Filter: ({ column }: { column?: Column<any, any>; table?: Table<any> }) => {
            const [filterMode, setFilterMode] = useState<FilterMode>('equals');
            const [filterValue, setFilterValue] = useState('');

            const handleInputChange = useCallback(
                (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    setFilterValue(value);

                    if (value) {
                        column?.setFilterValue({ mode: filterMode, value });
                    } else {
                        column?.setFilterValue(null);
                    }
                },
                [column, filterMode],
            );

            return (
                <Input
                    className='custom-react-table-numeric-filter'
                    placeholder='Search...'
                    value={filterValue}
                    onChange={handleInputChange}
                    type='number'
                    allowClear
                    prefix={
                        column && (
                            <InputPrefix
                                column={column}
                                filterValue={filterValue}
                                setFilterMode={setFilterMode}
                                filterMode={filterMode}
                            />
                        )
                    }
                />
            );
        },
        filterFn: ((row, columnId, filterValue) => {
            if (!filterValue) return true;

            const { mode, value } = filterValue;
            let cellValue = getFormatterCellValue(row.getValue(columnId));

            if (cellValue === null || cellValue === undefined) return true;

            const numericCellValue = Number(cellValue);
            const numericFilterValue = Number(value);

            if (isNaN(numericCellValue) || isNaN(numericFilterValue)) {
                // If we can't convert to numbers, fall back to string comparison
                const stringCellValue = String(cellValue).toLowerCase();
                const stringFilterValue = String(value).toLowerCase();
                return stringCellValue.includes(stringFilterValue);
            }

            switch (mode) {
                case 'greaterThan':
                    return numericCellValue > numericFilterValue;
                case 'lessThan':
                    return numericCellValue < numericFilterValue;
                case 'equals':
                    return numericCellValue === numericFilterValue;
                case 'contains':
                default:
                    return String(cellValue).includes(value);
            }
        }) as FilterFn<any>,
    };
};
