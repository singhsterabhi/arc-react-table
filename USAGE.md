# React Table Usage Guide

## Installation

```bash
npm install arc-react-table
```

### Install Peer Dependencies

```bash
npm install @tanstack/react-table@^8.21.3 react@^19.1.0 react-dom@^19.1.0 antd@^5.26.4
```

## Basic Usage

### 1. Import Component and Styles

```tsx
import ReactTable from 'arc-react-table';
```

### 2. Define Columns

```tsx
import { ColumnConfig } from 'arc-react-table';

const columns: ColumnConfig[] = [
    {
        id: 'name',
        header: 'Full Name',
        meta: {
            showPinning: true, // Enable column pinning
        },
    },
    {
        id: 'email',
        header: 'Email Address',
        enableColumnFilter: true, // Enable filtering for this column
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadgeCell value={getValue()} />,
    },
];
```

### 3. Basic Table Implementation

```tsx
function UserTable() {
    const [data, setData] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            status: 'Inactive',
        },
    ]);

    return (
        <ReactTable
            columns={columns}
            data={data}
            enablePagination={true}
            enableColumnFilters={true}
            enableRowSelection={true}
        />
    );
}
```

## Core Features

### Pagination

```tsx
<ReactTable
    columns={columns}
    data={data}
    enablePagination={true}
    pagination={{
        pageIndex: 0,
        pageSize: 25,
        pageSizeOptions: [25, 50, 100, 200],
    }}
    rowCount={totalRows} // For server-side pagination
    onPaginationChange={(pagination) => {
        // Handle pagination changes
        console.log('New page:', pagination.pageIndex);
    }}
/>
```

### Sorting

```tsx
const [sorting, setSorting] = useState([]);

<ReactTable
    columns={columns}
    data={data}
    sorting={sorting}
    onSortingChange={setSorting}
    // Multi-column sorting is enabled by default
/>;
```

### Column Filtering

```tsx
const [columnFilters, setColumnFilters] = useState([]);

<ReactTable
    columns={columns}
    data={data}
    enableColumnFilters={true}
    columnFilters={columnFilters}
    onColumnFiltersChange={setColumnFilters}
    enableQuickFilters={true} // Enable quick filter bar
    quickFilterColumns={['name', 'email']} // Specify searchable columns
/>;
```

### Row Selection

```tsx
const [rowSelection, setRowSelection] = useState({});

<ReactTable
    columns={columns}
    data={data}
    enableRowSelection={true}
    rowSelection={rowSelection}
    onRowSelectionChange={setRowSelection}
    showToggleAllRowsSelected={true}
    rowSelectionActions={[
        {
            label: 'Delete Selected',
            onClick: (selectedRows) => {
                console.log('Deleting:', selectedRows);
            },
            variant: 'danger',
        },
    ]}
/>;
```

## Advanced Features

### Row Expansion with Detail Panels

```tsx
<ReactTable
    columns={columns}
    data={data}
    enableExpanding={true}
    enableExpandAll={true}
    renderDetailPanel={({ row }) => (
        <div style={{ padding: '20px' }}>
            <h4>Details for {row.original.name}</h4>
            <p>Additional information...</p>
        </div>
    )}
    getSubRows={(row) => row.children} // For hierarchical data
/>
```

### Column Management

```tsx
const [columnVisibility, setColumnVisibility] = useState({});
const [columnPinning, setColumnPinning] = useState({});
const [columnSizing, setColumnSizing] = useState({});

<ReactTable
    columns={columns}
    data={data}
    // Column Visibility
    columnVisibility={columnVisibility}
    onColumnVisibilityChange={setColumnVisibility}
    enableColumnMenu={true}
    // Column Pinning
    enableColumnPinning={true}
    columnPinning={columnPinning}
    onColumnPinningChange={setColumnPinning}
    // Column Resizing
    enableColumnSizing={true}
    columnSizing={columnSizing}
    onColumnSizingChange={setColumnSizing}
/>;
```

### Infinite Scroll

```tsx
const [hasMoreData, setHasMoreData] = useState(true);

<ReactTable
    columns={columns}
    data={data}
    enableInfiniteScroll={true}
    hasMoreData={hasMoreData}
    onLoadMore={() => {
        // Load more data
        fetchMoreData().then((newData) => {
            setData((prev) => [...prev, ...newData]);
            setHasMoreData(newData.length > 0);
        });
    }}
    infiniteScrollThreshold={100} // pixels from bottom
/>;
```

### Data Export

```tsx
<ReactTable
    columns={columns}
    data={data}
    enableExport={true}
    onExport={(data) => {
        // Handle data export
        const csv = convertToCSV(data);
        downloadFile(csv, 'table-data.csv');
    }}
/>
```

### Real-time Data Polling

```tsx
<ReactTable
    columns={columns}
    data={data}
    enableRowPolling={true}
    defaultPollingInterval={5000} // 5 seconds
    getRowPollingConfig={(row) => ({
        enabled: row.original.status === 'processing',
        interval: 2000,
        onPoll: async (row) => {
            const updated = await fetchRowData(row.original.id);
            return updated;
        },
    })}
    updateRowData={(rowId, updatedData) => {
        setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...updatedData } : row)));
    }}
/>
```

## Built-in Cell Components

### Using Pre-built Cells

```tsx
import {
    StatusBadgeCell,
    DateCell,
    AuthorCell,
    ProgressBarCell,
    ActionCell,
} from 'arc-react-table';

const columns = [
    {
        id: 'author',
        header: 'Author',
        cell: ({ row }) => (
            <AuthorCell
                name={row.original.authorName}
                avatar={row.original.authorAvatar}
                email={row.original.authorEmail}
            />
        ),
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
            <StatusBadgeCell
                value={getValue()}
                colorMap={{
                    Active: 'green',
                    Inactive: 'red',
                    Pending: 'orange',
                }}
            />
        ),
    },
    {
        id: 'progress',
        header: 'Progress',
        cell: ({ getValue }) => (
            <ProgressBarCell value={getValue()} showLabel={true} color='blue' />
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <ActionCell
                actions={[
                    {
                        label: 'Edit',
                        onClick: () => editRow(row.original.id),
                        icon: <EditIcon />,
                    },
                    {
                        label: 'Delete',
                        onClick: () => deleteRow(row.original.id),
                        danger: true,
                    },
                ]}
            />
        ),
    },
];
```

### Cell Context Menus

```tsx
const columns = [
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        meta: {
            enableCellContextMenu: true,
            enableCopyValue: true,
            cellContextMenuActions: [
                {
                    key: 'edit',
                    label: 'Edit User',
                    onClick: (context) => {
                        console.log('Editing:', context.rowData);
                    },
                },
                {
                    key: 'delete',
                    label: 'Delete User',
                    onClick: (context) => {
                        deleteUser(context.rowData.id);
                    },
                    disabled: (context) => context.rowData.role === 'admin',
                },
            ],
        },
    },
];
```

## Styling and Customization

### Custom CSS Classes

```tsx
<ReactTable
    columns={columns}
    data={data}
    className='my-custom-table'
    isFullHeight={true} // Table takes full container height
/>
```

### Custom Loading States

```tsx
<ReactTable
    columns={columns}
    data={data}
    loading={isLoading}
    loaderType='table' // or "full"
    loaderIcon={<CustomSpinner />}
/>
```

### Custom Empty States

```tsx
<ReactTable
    columns={columns}
    data={[]} // Empty data
    // Built-in empty state will show automatically
/>
```

## State Persistence

```tsx
<ReactTable
    columns={columns}
    data={data}
    enableTableConfigPersistence={true}
    tableConfigKey='my-table-config' // Unique key for persistence
    // Column order, visibility, sizing, etc. will be saved
/>
```

## Performance Optimization

### Row Virtualization

```tsx
<ReactTable
    columns={columns}
    data={largeDataSet}
    enableRowVirtualization={true}
    rowHeight={50} // Fixed row height for better performance
/>
```

### Custom Cell Renderers

```tsx
const cellRenderers = {
    'custom-cell': ({ value, row }) => (
        <div className='custom-cell'>{/* Your custom component */}</div>
    ),
};

<ReactTable columns={columns} data={data} cellRenderers={cellRenderers} />;
```

## Important Notes

- **Always import the CSS file** - The component relies on CSS for proper styling
- Import the CSS file in your main app file or component file
- Use TypeScript for better development experience with full type checking
- The table is built on TanStack Table v8 - refer to their docs for advanced column definitions

## Files Included in Package

- `dist/react-table.es.js` - Main JavaScript bundle
- `dist/react-table.css` - CSS styles
- `dist/index.d.ts` - TypeScript definitions

## Export Configuration

The package exports:

- Main component: `arc-react-table` (supports both named and default imports)
- CSS styles: `arc-react-table/css` or `arc-react-table/dist/react-table.css`
- TypeScript definitions: Automatically included
- All cell components and types for advanced usage
