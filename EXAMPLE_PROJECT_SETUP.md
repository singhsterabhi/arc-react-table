# Example: Using arc-react-table in a New Project

This guide shows how to set up a new React project and use the `arc-react-table` package from npm.

## Prerequisites

1. Node.js (version 18 or higher)
2. npm or yarn package manager
3. React 17 or higher

## Step 1: Create a New React Project

```bash
# Create new React app
npx create-react-app my-table-app --template typescript
cd my-table-app
```

## Step 2: Install the Package and Dependencies

```bash
# Install the react-table package from npm
npm install arc-react-table

# Install required peer dependencies
npm install @tanstack/react-table@^8.21.3 antd@^5.26.4

# Install optional dependencies for advanced features (these are actually included as dependencies)
# npm install @dnd-kit/core@^6.3.1 @dnd-kit/modifiers@^9.0.0 @dnd-kit/sortable@^10.0.0 @tanstack/react-virtual@^3.13.12 react-animate-height@^3.2.3 react-date-range@^2.0.1 classnames@^2.5.1 dayjs@^1.11.13 lodash@^4.17.21

# Note: @tanstack/react-query and other dependencies are included automatically
# The table automatically handles QueryClient setup for polling features
```

## Step 3: package.json After Installation

Your `package.json` will look like this:

```json
{
    "name": "my-table-app",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
        "arc-react-table": "^0.1.0",
        "@tanstack/react-table": "^8.21.3",
        "@tanstack/react-virtual": "^3.13.12",
        "@dnd-kit/core": "^6.3.1",
        "@dnd-kit/modifiers": "^9.0.0",
        "@dnd-kit/sortable": "^10.0.0",
        "antd": "^5.26.4",
        "classnames": "^2.5.1",
        "dayjs": "^1.11.13",
        "lodash": "^4.17.21",
        "react": "^19.1.0",
        "react-animate-height": "^3.2.3",
        "react-date-range": "^2.0.1",
        "react-dom": "^19.1.0",
        "react-scripts": "5.0.1",
        "typescript": "^4.9.5",
        "web-vitals": "^2.1.4"
    }
}
```

## Step 4: Use the Component

Create a new file `src/TableExample.tsx`:

```tsx
import React from 'react';
import ReactTable from 'arc-react-table';
// Import Ant Design styles
import 'antd/dist/reset.css';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    created: string;
}

const TableExample: React.FC = () => {
    const columns = [
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
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
        },
        {
            id: 'created',
            header: 'Created',
            accessorKey: 'created',
        },
    ];

    const data: User[] = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: 'Admin',
            status: 'active',
            created: '2024-01-15',
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            role: 'User',
            status: 'active',
            created: '2024-01-20',
        },
        {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob.johnson@company.com',
            role: 'Moderator',
            status: 'inactive',
            created: '2024-01-10',
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Users Table</h1>
            <ReactTable
                columns={columns}
                data={data}
                enablePagination={true}
                enableColumnFilters={true}
                enableRowSelection={true}
                enableSorting={true}
            />
        </div>
    );
};

export default TableExample;
```

## Step 5: Update App.tsx

```tsx
import React from 'react';
import TableExample from './TableExample';
import './App.css';

function App() {
    return (
        <div className='App'>
            <TableExample />
        </div>
    );
}

export default App;
```

## Step 6: Run the Project

```bash
npm start
```

## Updating the Package

When you publish new versions of `arc-react-table`, teams can update it like any other package:

```bash
# Update to latest version
npm update arc-react-table

# Or install specific version
npm install arc-react-table@^0.2.0
```

## Team Workflow

1. **Install Package**: `npm install arc-react-table`
2. **Install Dependencies**: Install required peer dependencies
3. **Import and Use**: Import the component and use it like any React component
4. **Updates**: Use standard npm update commands

## Troubleshooting

### Package Not Found

- Ensure you have a working internet connection
- Verify the package name is spelled correctly: `arc-react-table`
- Check if npm registry is accessible: `npm ping`

### Version Conflicts

- Check peer dependency versions match requirements
- Use `npm ls` to see dependency tree
- Consider using `npm install --legacy-peer-deps` if needed
- Update React and related packages if using older versions
