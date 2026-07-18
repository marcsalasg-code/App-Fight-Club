"use client"

import * as React from "react"
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination"
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options"
import { SearchInput } from "@/components/ui/search-input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

import { AthleteColumn, columns } from "./columns"
import { deleteAthletes } from "../actions"
import { toast } from "sonner"

interface AthletesTableProps {
    data: AthleteColumn[]
}

export function AthletesTable({ data }: AthletesTableProps) {
    return (
        <CustomDataTable data={data} columns={columns} />
    )
}



import { useVirtualizer } from "@tanstack/react-virtual"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDataTable({ data, columns }: { data: AthleteColumn[], columns: any[] }) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])

    const parentRef = React.useRef<HTMLDivElement>(null)

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getRowId: (originalRow) => originalRow.id, // Use actual ID as row ID
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    const { rows } = table.getRowModel()

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 53, // Average height of a table row
        overscan: 5,
    })

    const selectedIds = Object.keys(rowSelection); // Now this contains actual IDs

    const handleBulkDelete = async () => {
        if (!confirm(`¿Estás seguro de eliminar ${selectedIds.length} atletas? Esta acción no se puede deshacer.`)) return;

        const promise = deleteAthletes(selectedIds)

        toast.promise(promise, {
            loading: 'Eliminando...',
            success: (data) => {
                setRowSelection({})
                return 'Atletas eliminados correctamente'
            },
            error: 'Error al eliminar',
        });
    }

    const virtualItems = rowVirtualizer.getVirtualItems()
    const totalSize = rowVirtualizer.getTotalSize()

    const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0
    const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <SearchInput
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="h-8 w-[250px] lg:w-[350px]"
                    />
                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 ml-2"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar ({selectedIds.length})
                        </Button>
                    )}
                </div>
                <DataTableViewOptions table={table} />
            </div>
            <div
                ref={parentRef}
                className="rounded-md border max-h-[600px] overflow-auto relative"
            >
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {rows.length ? (
                            <>
                                {paddingTop > 0 && (
                                    <TableRow>
                                        <TableCell style={{ height: `${paddingTop}px` }} colSpan={columns.length} />
                                    </TableRow>
                                )}
                                {virtualItems.map((virtualRow) => {
                                    const row = rows[virtualRow.index]
                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            data-index={virtualRow.index}
                                            ref={rowVirtualizer.measureElement}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                })}
                                {paddingBottom > 0 && (
                                    <TableRow>
                                        <TableCell style={{ height: `${paddingBottom}px` }} colSpan={columns.length} />
                                    </TableRow>
                                )}
                            </>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Sin resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}
