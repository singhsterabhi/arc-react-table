import {
    TableFeature,
    Table,
    Updater,
    functionalUpdate,
    RowData,
    InitialTableState,
    TableOptionsResolved,
} from '@tanstack/react-table';

// Step 1: Set up TypeScript types for our feature
export interface ColumnFiltersVisibilityState {
    columnFiltersVisibility: boolean;
}

export interface ColumnFiltersVisibilityOptions {
    enableColumnFiltersVisibilityToggle?: boolean;
    onColumnFiltersVisibilityToggleChange?: (updater: Updater<boolean>) => void;
}

// Step 2: Use declaration merging to add new types to TanStack Table
declare module '@tanstack/react-table' {
    interface TableState {
        columnFiltersVisibility: boolean;
    }
    interface InitialTableState {
        columnFiltersVisibility?: boolean;
    }

    interface TableOptions<TData extends RowData> {
        enableColumnFiltersVisibilityToggle?: boolean;
        onColumnFiltersVisibilityToggleChange?: (updater: Updater<boolean>) => void;
    }

    interface Table<TData extends RowData> {
        toggleColumnFiltersVisibility: () => void;
        setColumnFiltersVisibility: (updater: Updater<boolean>) => void;
    }
}

// Step 3: Create the Feature Object
export const ColumnFiltersVisibilityFeature: TableFeature = {
    // Define the new feature's initial state
    getInitialState: (initialState?: InitialTableState): ColumnFiltersVisibilityState => {
        const columnFiltersVisibility = initialState?.columnFiltersVisibility;

        return {
            columnFiltersVisibility: columnFiltersVisibility ?? true,
        };
    },

    // Define the new feature's default options
    getDefaultOptions: <TData extends RowData>(
        table: Table<TData>,
    ): Partial<TableOptionsResolved<TData>> => {
        return {
            enableColumnFiltersVisibilityToggle: true,
            onColumnFiltersVisibilityToggleChange: (updater: Updater<boolean>) => {
                table.setState((old) => ({
                    ...old,
                    columnFiltersVisibility: functionalUpdate(updater, old.columnFiltersVisibility),
                }));
            },
        } as Partial<TableOptionsResolved<TData>>;
    },

    // Define the new feature's table instance methods
    createTable: <TData extends RowData>(table: Table<TData>): void => {
        table.setColumnFiltersVisibility = (updater) => {
            const options = table.options as any;
            options.onColumnFiltersVisibilityToggleChange?.(updater);
        };

        table.toggleColumnFiltersVisibility = () => {
            table.setColumnFiltersVisibility((prev) => !prev);
        };
    },
};
