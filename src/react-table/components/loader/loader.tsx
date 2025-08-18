import './loader.less';
import { useMemo } from 'react';
import { ColumnDef, Table } from '@tanstack/react-table';
import { ColGroup } from '../colgroup/colgroup';

interface ReactTableLoaderProps {
    table: Table<any>;
    columns: ColumnDef<any>[];
    addExtraColumn?: boolean;
}

const LOADER_ROWS = 7;

function ReactTableLoader({ table, columns, addExtraColumn }: ReactTableLoaderProps) {
    const rowIndices = useMemo(() => Array.from({ length: LOADER_ROWS }, (_, i) => i), []);

    const getColumnKey = (column: ColumnDef<any>, index: number): string => {
        // console.log('column', column);
        const id = typeof column.id === 'object' ? JSON.stringify(column.id) : column.id;
        const accessorKey = typeof column.id === 'object' ? JSON.stringify(column.id) : column.id;
        return id || accessorKey || `column-${index}`;
    };

    return (
        <table className='react-table-table'>
            <ColGroup table={table} />
            <tbody>
                <tr>
                    <td className='td-loader-column' colSpan={columns.length}>
                        <div className='td-loader'></div>
                    </td>
                </tr>
                {rowIndices.map((index) => (
                    <tr key={`loader-row-${index}`}>
                        {columns.map((column, colIndex) => (
                            <td key={getColumnKey(column, colIndex)} scope='col'>
                                <div className='cell'>&nbsp;</div>
                            </td>
                        ))}
                        {addExtraColumn && (
                            <td scope='col' className='extra-column-cell'>
                                <div className='cell'>&nbsp;</div>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ReactTableLoader;
