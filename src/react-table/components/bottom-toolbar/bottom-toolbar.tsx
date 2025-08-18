import './bottom-toolbar.less';
import { PaginationState } from '@tanstack/react-table';

import ReactTablePagination from '../pagination/pagination';
interface ReactTableBottomToolbarProps {
    enablePagination: boolean;
    pagination: PaginationState & { pageSizeOptions?: number[] };
    totalPageCount?: number;
    onPaginationChange?: (
        pagination: PaginationState | ((prev: PaginationState) => PaginationState),
    ) => void;
    loading: boolean;
    bottomToolbarComponent?: React.ReactNode;
    paginationType?: 'standard' | 'cursor';
    hasMoreData?: boolean;
}

export default function ReactTableBottomToolbar({
    enablePagination,
    pagination,
    totalPageCount,
    onPaginationChange,
    loading,
    bottomToolbarComponent,
    paginationType,
    hasMoreData,
}: ReactTableBottomToolbarProps) {
    const handlePaginationChange = (page: number, pageSize: number) => {
        if (onPaginationChange) {
            // Convert 1-based page index from Antd to 0-based for react-table
            onPaginationChange({ pageIndex: page - 1, pageSize });
        }
    };

    return (
        <div className='react-table-bottom-toolbar'>
            <div className='react-table-bottom-toolbar-left'>{bottomToolbarComponent}</div>
            <div>
                {enablePagination && (
                    <ReactTablePagination
                        pagination={pagination}
                        loading={loading}
                        totalPageCount={totalPageCount}
                        handlePaginationChange={handlePaginationChange}
                        paginationType={paginationType}
                        hasMoreData={hasMoreData}
                    />
                )}
            </div>
        </div>
    );
}
