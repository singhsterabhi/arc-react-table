import classNames from 'classnames';
import Icon from '@ant-design/icons/lib/components/Icon';
import SortIcon from '../../../assets/icons/Sort.svg?react';
import UpArrowIcon from '../../../assets/icons/Arrow-Up.svg?react';
import DownArrowIcon from '../../../assets/icons/Arrow-Down.svg?react';
import { Header } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

interface SortElementProps {
    header: Header<any, unknown>;
}

const SortElement: React.FC<SortElementProps> = ({ header }) => {
    const sorted = header.column.getIsSorted();

    // Memoize the click handler to prevent recreation on every render
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const handler = header.column.getToggleSortingHandler();
            if (handler) {
                handler(e);
            }
        },
        [header.column],
    );

    // Memoize the icon component to prevent recreation
    const IconComponent = useMemo(() => {
        return sorted ? (sorted === 'asc' ? UpArrowIcon : DownArrowIcon) : SortIcon;
    }, [sorted]);

    // Memoize the style objects to prevent recreation
    const iconWrapperStyle = useMemo(
        () => ({
            width: 14,
            height: 14,
            verticalAlign: 'sub' as const,
        }),
        [],
    );

    const iconStyle = useMemo(
        () => ({
            width: 14,
            height: 14,
        }),
        [],
    );

    // Memoize the icon component function to prevent recreation
    const iconComponent = useCallback(() => {
        return <IconComponent style={iconStyle} />;
    }, [IconComponent, iconStyle]);

    return (
        <span className={classNames('table-sorter')} onClick={handleClick}>
            <Icon style={iconWrapperStyle} component={iconComponent} />
        </span>
    );
};

export default SortElement;
