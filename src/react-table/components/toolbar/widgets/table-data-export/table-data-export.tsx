import DownloadOutlined from '@ant-design/icons/lib/icons/DownloadOutlined';
import { useCallback } from 'react';
import { Table } from '@tanstack/react-table';
import { WidgetButton } from '../widget-button/widget-button';

interface TableDataExportProps {
    onExport?: (data: any[]) => void;
    table: Table<any>;
    widgetButtonSize?: 'sm' | 'md' | 'lg';
}

export const TableDataExport = ({
    onExport,
    table,
    widgetButtonSize = 'md',
}: TableDataExportProps) => {
    const handleExport = useCallback(() => {
        // Default export logic (CSV for now) - can be overridden by onExport prop
        const dataToExport = table.getFilteredRowModel().rows.map((row) => row.original);
        if (onExport) {
            onExport(dataToExport);
        } else {
            // Simple CSV export implementation
            const headers = table
                .getAllLeafColumns()
                .filter(
                    (col) => !['react-table-row-select', 'react-table-row-expand'].includes(col.id),
                ) // Exclude select/expand cols
                .map((col) => col.id); // Use col.id for header, consider using a display name if available

            const csvContent = [
                headers.join(','), // Header row
                ...dataToExport.map(
                    (row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(','), // Data rows, handle null/undefined
                ),
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `table-data-${new Date().toISOString()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [table, onExport]);

    return (
        <WidgetButton
            table={table}
            title='Export Data'
            icon={<DownloadOutlined />}
            onClick={handleExport}
            size={widgetButtonSize}
        />
    );
};

TableDataExport.displayName = 'TableDataExport';
