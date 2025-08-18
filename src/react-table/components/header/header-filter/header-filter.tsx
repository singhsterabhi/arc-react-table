import { Header, Table } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import './header-filter.less';

const HeaderFilter = ({ header, table }: { header: Header<any, unknown>; table: Table<any> }) => {
    const filtersEnabled = table.options.meta?.filtersEnabled;
    const enableColumnFilters = table.options.meta?.enableColumnFilters;
    const canFilter = filtersEnabled && enableColumnFilters;

    return (
        <div className='column-filter-wrapper' onClick={(e) => e.stopPropagation()}>
            <div className={`column-filter-content ${canFilter ? 'visible' : 'hidden'}`}>
                {
                    header.column.getCanFilter() && header.column.columnDef.meta?.Filter
                        ? flexRender(header.column.columnDef.meta?.Filter, header.getContext())
                        : null // Render nothing if filter definition is missing, even if canFilter is true
                }
            </div>
        </div>
    );
};

export const HeaderFilterComponent = HeaderFilter;
