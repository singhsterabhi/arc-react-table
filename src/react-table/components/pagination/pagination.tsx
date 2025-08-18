import { PaginationState } from '@tanstack/react-table';
import './pagination.less';
import Pagination from 'antd/es/pagination/Pagination';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Select from 'antd/es/select';
import { useCallback } from 'react';
import ArrowIcon from '../../assets/icons/right-arrow.svg?react';

interface ReactTablePaginationProps {
    pagination: PaginationState & { pageSizeOptions?: number[] };
    loading: boolean;
    totalPageCount?: number;
    handlePaginationChange: (page: number, pageSize: number) => void;
    paginationType?: 'standard' | 'cursor';
    hasMoreData?: boolean;
}

export default function ReactTablePagination({
    pagination,
    loading,
    totalPageCount,
    handlePaginationChange,
    paginationType = 'standard',
    hasMoreData,
}: ReactTablePaginationProps) {
    if (paginationType === 'cursor') {
        return (
            <CursorPagination
                pagination={pagination}
                loading={loading}
                handlePaginationChange={handlePaginationChange}
                hasMoreData={hasMoreData}
            />
        );
    }

    return (
        <Pagination
            current={pagination.pageIndex + 1}
            pageSize={pagination.pageSize}
            pageSizeOptions={pagination.pageSizeOptions ?? [25, 50, 100]}
            total={loading ? undefined : totalPageCount}
            size='small'
            onChange={handlePaginationChange}
            showSizeChanger
            showTotal={loading || !totalPageCount ? undefined : (total) => `Total ${total} items`}
            disabled={loading}
            showLessItems
            className='react-table-pagination'
        />
    );
}

const CursorPagination = ({
    pagination,
    loading,
    handlePaginationChange,
    hasMoreData,
}: ReactTablePaginationProps) => {
    const { pageIndex, pageSize } = pagination;
    const currentPage = pageIndex + 1;

    const handleGoToFirst = useCallback(() => {
        handlePaginationChange(1, pageSize);
    }, [handlePaginationChange, pageSize]);

    const handlePrevious = useCallback(() => {
        if (pageIndex > 0) {
            handlePaginationChange(currentPage - 1, pageSize);
        }
    }, [currentPage, handlePaginationChange, pageIndex, pageSize]);

    const handleNext = useCallback(() => {
        if (hasMoreData) {
            handlePaginationChange(currentPage + 1, pageSize);
        }
    }, [currentPage, hasMoreData, handlePaginationChange, pageSize]);

    const handlePageSizeChange = useCallback(
        (value: number) => {
            handlePaginationChange(1, value);
        },
        [handlePaginationChange],
    );

    const pageSizeOptions = pagination.pageSizeOptions ?? [25, 50, 100];

    return (
        <Space className='react-table-pagination react-table-pagination-cursor'>
            {pageIndex > 0 && (
                <Button
                    onClick={handleGoToFirst}
                    disabled={loading}
                    size='small'
                    type='link'
                    className='react-table-pagination-cursor-button react-table-pagination-cursor-button-first'
                >
                    <span>
                        <ArrowIcon className='react-table-pagination-cursor-button-arrow-left' />
                        <ArrowIcon className='react-table-pagination-cursor-button-arrow-left' />
                    </span>
                    First
                </Button>
            )}
            <Button
                onClick={handlePrevious}
                disabled={loading || pageIndex === 0}
                size='small'
                type='link'
                className='react-table-pagination-cursor-button react-table-pagination-cursor-button-previous'
            >
                <ArrowIcon className='react-table-pagination-cursor-button-arrow-left' />
                Previous
            </Button>
            <span className='current-page-indicator'>{currentPage}</span>
            <Button
                onClick={handleNext}
                disabled={loading || !hasMoreData}
                size='small'
                type='link'
                className='react-table-pagination-cursor-button react-table-pagination-cursor-button-next'
            >
                Next
                <ArrowIcon />
            </Button>
            <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                disabled={loading}
                size='small'
                className='react-table-pagination-cursor-page-size'
                options={pageSizeOptions.map((size) => ({
                    value: size,
                    label: `${size} / page`,
                }))}
                popupMatchSelectWidth={false}
            />
        </Space>
    );
};
