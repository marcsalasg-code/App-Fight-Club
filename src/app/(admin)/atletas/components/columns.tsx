"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { MoreHorizontal, Trophy, Eye } from "lucide-react"
import Link from "next/link"
import { deleteAthlete } from "../actions"
import { toast } from "sonner"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

// Define the type for our data
export type AthleteColumn = {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    status: string
    level: string
    isCompetitor: boolean

    hasActiveSubscription: boolean
    tags?: { label: string; color: string }[]
}

export const columns: ColumnDef<AthleteColumn>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Seleccionar todo"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Seleccionar fila"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name", // Virtual column for sorting/filtering ease? Or just combine in cell. 
        // Creating separate accessor functions for sorting
        id: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
        accessorFn: row => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                        {row.original.firstName[0]}
                        {row.original.lastName[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                            {row.original.firstName} {row.original.lastName}
                            {row.original.isCompetitor && (
                                <Trophy className="h-3 w-3 text-yellow-500" />
                            )}
                        </span>
                    </div>
                </div>
            )
        },
    },

    {
        id: "tags",
        header: "Etiquetas",
        cell: ({ row }) => {
            const tags = row.original.tags || [];
            if (tags.length === 0) return null;
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 2).map((tag, i) => (
                        <div
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white whitespace-nowrap"
                            style={{ backgroundColor: tag.color }}
                        >
                            {tag.label}
                        </div>
                    ))}
                    {tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                            +{tags.length - 2}
                        </span>
                    )}
                </div>
            );
        }
    },
    {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <div className="lowercase text-muted-foreground">{row.getValue("email") || "-"}</div>,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const styles = {
                ACTIVE: "bg-green-500/10 text-green-700 border-green-200",
                INACTIVE: "bg-gray-500/10 text-gray-700 border-gray-200",
                SUSPENDED: "bg-red-500/10 text-red-700 border-red-200",
            }[status] || "bg-gray-100"

            const labels = {
                ACTIVE: "Activo",
                INACTIVE: "Inactivo",
                SUSPENDED: "Suspendido",
            }[status] || status

            return <Badge className={styles}>{labels}</Badge>
        },
        filterFn: (row, id, value) => {
            // Basic includes filter
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "level",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nivel" />,
        cell: ({ row }) => {
            const labels: Record<string, string> = {
                BEGINNER: "Principiante",
                INTERMEDIATE: "Intermedio",
                ADVANCED: "Avanzado",
            };
            return <Badge variant="outline">{labels[row.getValue("level") as string] || row.getValue("level")}</Badge>
        }
    },
    {
        id: "subscription",
        header: "Suscripción",
        cell: ({ row }) => {
            return row.original.hasActiveSubscription ? (
                <Badge variant="secondary" className="bg-green-500/10 text-green-700">Activa</Badge>
            ) : (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">Inactiva</Badge>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const athlete = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(athlete.id)}
                        >
                            Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/atletas/${athlete.id}`}>
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> Ver detalle
                            </DropdownMenuItem>
                        </Link>
                        <Link href={`/atletas/${athlete.id}/editar`}>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={async () => {
                                if (confirm("¿Estás seguro de eliminar este atleta?")) {
                                    await deleteAthlete(athlete.id);
                                    toast.success("Atleta eliminado");
                                }
                            }}
                            className="text-red-600 focus:text-red-600"
                        >
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
