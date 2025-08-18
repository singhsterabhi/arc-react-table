import React, { useState, useMemo, useCallback } from 'react';
import Tag from 'antd/es/tag';
import Popover from 'antd/es/popover';
import Input from 'antd/es/input';
import SearchOutlined from '@ant-design/icons/lib/icons/SearchOutlined';
import classNames from 'classnames';

interface QuickFiltersPopoverProps {
    remainingTags: Array<{
        value: string | string[];
        label: string;
        count: number;
    }>;
    isValueSelected: (value: string | string[]) => boolean;
    onTagClick: (value: string | string[]) => void;
    popupContainer?: (triggerNode: HTMLElement) => HTMLElement;
}

const QuickFiltersPopover: React.FC<QuickFiltersPopoverProps> = ({
    remainingTags,
    isValueSelected,
    onTagClick,
    popupContainer,
}) => {
    const [searchText, setSearchText] = useState('');
    const [popoverVisible, setPopoverVisible] = useState(false);

    // Filter remaining tags based on search text
    const filteredRemainingTags = useMemo(
        () =>
            remainingTags.filter((tag) =>
                tag.label.toLowerCase().includes(searchText.toLowerCase()),
            ),
        [remainingTags, searchText],
    );

    const handleTagClick = useCallback(
        (value: string | string[]) => {
            onTagClick(value);
            setSearchText('');
        },
        [onTagClick],
    );

    const popoverContent = (
        <div className='quick-filters-popover-content'>
            <Input
                placeholder='Search'
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            <div className='quick-filters-popover-content-tags'>
                {filteredRemainingTags.map(({ value, count, label }) => (
                    <Tag
                        key={Array.isArray(value) ? value.join('-') : value}
                        onClick={() => handleTagClick(value)}
                        className={classNames('quick-filter-tag', {
                            'quick-filter-tag-selected': isValueSelected(value),
                        })}
                    >
                        {label} ({count})
                    </Tag>
                ))}

                {filteredRemainingTags.length === 0 && (
                    <div style={{ padding: 8, textAlign: 'center' }}>No matching tags</div>
                )}
            </div>
        </div>
    );

    return (
        <Popover
            content={popoverContent}
            title='More Filters'
            trigger='click'
            open={popoverVisible}
            onOpenChange={setPopoverVisible}
            className='quick-filters-popover'
            getPopupContainer={popupContainer}
        >
            <Tag
                className={classNames('quick-filter-tag quick-filter-tag-remaining', {
                    'quick-filter-tag-selected': remainingTags.some((tag) =>
                        isValueSelected(tag.value),
                    ),
                })}
            >
                +{remainingTags.length} more
            </Tag>
        </Popover>
    );
};

export default QuickFiltersPopover;
