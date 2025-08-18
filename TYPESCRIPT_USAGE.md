# TypeScript Usage Guide

## Import Options

Now you have multiple ways to import the ReactTable component with full TypeScript support:

### Option 1: Named Import (Recommended)

```typescript
import ReactTable from 'arc-react-table';

// Full TypeScript support and autocomplete
<ReactTable
  columns={columns}
  data={data}
  enablePagination={true}
  // TypeScript will provide autocomplete and type checking for all props
/>
```

### Option 2: Default Import

```typescript
import ReactTable from 'arc-react-table';

// Full TypeScript support
<ReactTable
  columns={columns}
  data={data}
  // All props are typed
/>
```

### Option 3: Re-exported as Named Import

```typescript
import { ReactTable as ReactTableNamed } from 'arc-react-table';

<ReactTableNamed
  columns={columns}
  data={data}
/>
```

## TypeScript Features Available

- ✅ **Full prop autocomplete** - IntelliSense will show all available props
- ✅ **Type checking** - TypeScript will validate prop types
- ✅ **Required prop validation** - Missing required props will show errors
- ✅ **Prop documentation** - Hover over props to see their descriptions
- ✅ **Generic type support** - Properly typed for your data structures

## Example with Full Typing

```typescript
import { ReactTable, ReactTableProps } from 'arc-react-table';
import { ColumnDef } from '@tanstack/react-table';
import 'arc-react-table/css';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnDef<UserData>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'role',
    header: 'Role',
    accessorKey: 'role',
  },
];

const data: UserData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

function MyTableComponent() {
  return (
    <ReactTable
      columns={columns}
      data={data}
      enablePagination={true}
      enableColumnFilters={true}
      enableRowSelection={true}
      // TypeScript will validate all these props and provide autocomplete
    />
  );
}
```

## TypeScript Configuration

Make sure your `tsconfig.json` includes:

```json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "moduleResolution": "bundler",
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true
    }
}
```

## Troubleshooting

If you still see TypeScript errors:

1. **Clear your IDE's TypeScript cache**
2. **Restart your TypeScript server** (VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")
3. **Delete node_modules/.cache** if using a bundler with caching
4. **Ensure you're using the latest version** of the package
