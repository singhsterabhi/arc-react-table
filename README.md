# React Table

### One Table to Rule Them All

A powerful, feature-rich React table component library built on top of [TanStack Table](https://tanstack.com/table/v8) with comprehensive TypeScript support.

## Features

### 🚀 Core Features

- **Data Visualization** - Display data in a flexible, customizable table format
- **Full TypeScript Support** - Complete type definitions with autocomplete and IntelliSense
- **Responsive Design** - Mobile-friendly with proper styling
- **Performance Optimized** - Virtualization and infinite scroll support

### 📊 Data Management

- **Sorting** - Multi-column sorting with visual indicators
- **Filtering** - Column filters, quick filters, and global search
- **Pagination** - Standard and cursor-based pagination
- **Infinite Scroll** - Load more data as users scroll
- **Row Selection** - Single or multi-row selection with bulk actions

### 🎨 UI Features

- **Column Management** - Pinning, ordering, resizing, and visibility controls
- **Row Expansion** - Expandable rows with detail panels
- **Context Menus** - Right-click actions on cells and rows
- **Loading States** - Customizable loading indicators
- **Empty States** - Graceful handling of no data scenarios

### 🔧 Advanced Features

- **Data Polling** - Real-time updates at row or table level
- **Data Export** - Export table data in various formats
- **Custom Cell Renderers** - Build your own cell components
- **Drag & Drop** - Reorder columns and rows
- **State Persistence** - Save and restore table configuration

## Built-in Cell Types

The library comes with pre-built cell components for common use cases:

- **Text Cell** - Basic text display with formatting options
- **Date Cell** - Date formatting and display
- **Author Cell** - User information with avatar and name
- **Status Badge Cell** - Colored status indicators
- **Status Tag Cell** - Tag-style status displays
- **Progress Bar Cell** - Visual progress indicators
- **Action Cell** - Buttons and dropdown menus
- **Entity Cell** - Complex entity representations
- **Checkbox Cell** - Selection checkboxes
- **Expand Row Cell** - Row expansion controls

## Installation

```bash
npm install arc-react-table
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install @tanstack/react-table@^8.21.3 react@^19.1.0 react-dom@^19.1.0 antd@^5.26.4
```

**React Query Integration:** The library includes `@tanstack/react-query` as a dependency and automatically handles QueryClient setup. If your app already has a QueryClient, the table will use the existing one. If not, it will create its own internal QueryClient for polling features.

<details>
<summary>Complete list of peer dependencies</summary>

```json
{
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/modifiers": "^9.0.0",
    "@dnd-kit/sortable": "^10.0.0",
    "@tanstack/react-query": "^5.82.0",
    "@tanstack/react-table": "^8.21.3",
    "@tanstack/react-virtual": "^3.13.12",
    "antd": "^5.26.4",
    "classnames": "^2.5.1",
    "dayjs": "^1.11.13",
    "lodash": "^4.17.21",
    "react": "^19.1.0",
    "react-animate-height": "^3.2.3",
    "react-date-range": "^2.0.1",
    "react-dom": "^19.1.0"
}
```

</details>

## Quick Start

```tsx
import ReactTable from 'arc-react-table';

const columns = [
    {
        id: 'name',
        header: 'Name',
    },
    {
        id: 'email',
        header: 'Email',
    },
    {
        id: 'role',
        header: 'Role',
    },
];

const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

function MyTable() {
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

**Important:** Always import the CSS file for proper styling!

## Documentation

- [**Usage Guide**](./USAGE.md) - Detailed usage examples and API reference
- [**TypeScript Guide**](./TYPESCRIPT_USAGE.md) - TypeScript-specific usage and best practices

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests on the [GitHub repository](https://github.com/singhsterabhi/arc-react-table).

## License

ISC

---

Built with ❤️ using [TanStack Table](https://tanstack.com/table/v8) and [Ant Design](https://ant.design/)
