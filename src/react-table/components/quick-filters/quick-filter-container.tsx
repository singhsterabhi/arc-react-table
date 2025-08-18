import { Table } from '@tanstack/react-table';
import TableQuickFilters from './table-quick-filters';
import './quick-filters.less';

const QuickFilterContainer = ({
    table,
    quickFilterColumns,
}: {
    table: Table<any>;
    quickFilterColumns: string[];
}) => {
    return (
        <div className='quick-filters-container'>
            <TableQuickFilters table={table} quickFilterColumns={quickFilterColumns} />
        </div>
    );
};

export default QuickFilterContainer;
