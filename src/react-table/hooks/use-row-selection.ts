import { RowSelectionState } from '@tanstack/react-table';
import { useCallback, useState, useEffect } from 'react';

export const useRowSelection = (
    initialRowSelection: RowSelectionState | undefined,
    onRowSelectionChange:
        | ((
              updaterOrValue: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState),
          ) => void)
        | undefined,
) => {
    const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>(
        () => initialRowSelection ?? {},
    );

    useEffect(() => {
        setRowSelectionState(initialRowSelection ?? {});
    }, [initialRowSelection]);

    // Handle row selection change
    const handleRowSelectionChange = useCallback(
        (updaterOrValue: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
            if (onRowSelectionChange) {
                onRowSelectionChange(updaterOrValue);
            } else {
                setRowSelectionState((prevState) =>
                    typeof updaterOrValue === 'function'
                        ? updaterOrValue(prevState)
                        : updaterOrValue,
                );
            }
        },
        [onRowSelectionChange],
    );

    return {
        rowSelectionState,
        handleRowSelectionChange,
    };
};
