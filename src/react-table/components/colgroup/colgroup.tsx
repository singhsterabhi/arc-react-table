import { Header, Table } from '@tanstack/react-table';

interface ColGroupProps<TData> {
    table: Table<TData>;
    addExtraColumn?: boolean;
}

export const ColGroup = <TData,>({ table, addExtraColumn }: ColGroupProps<TData>) => {
    // Get leaf headers for each section
    const leftHeaders = table.getLeftLeafHeaders();
    const centerHeaders = table.getCenterLeafHeaders();
    const rightHeaders = table.getRightLeafHeaders();

    return (
        <colgroup>
            {/* Left Pinned Columns */}
            {leftHeaders.map((header: Header<TData, unknown>) => (
                <col key={header.id} width={header.getSize()} />
            ))}
            {/* Center Non-Pinned Columns */}
            {centerHeaders.map((header: Header<TData, unknown>) => (
                <col key={header.id} width={header.getSize()} />
            ))}
            {/* Extra column inserted after center, before right */}
            {addExtraColumn && <col width={'100%'} />}
            {/* Right Pinned Columns */}
            {rightHeaders.map((header: Header<TData, unknown>) => (
                <col key={header.id} width={header.getSize()} />
            ))}
        </colgroup>
    );
};
