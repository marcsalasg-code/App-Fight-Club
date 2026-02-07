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

    // Rich indicators
    membershipColor: "green" | "yellow" | "red"
    membershipLabel: string
    sessionsBadge: string | null
    isOverLimit: boolean
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
        accessorKey: "name",
        id: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
        accessorFn: row => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    {/* Status Dot */}
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${row.original.membershipColor === "green" ? "bg-green-500" :
                            row.original.membershipColor === "yellow" ? "bg-yellow-500" : "bg-red-500"
                        }`} />

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
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
        cell: ({ row }) => {
            const color = row.original.membershipColor;
            const label = row.original.membershipLabel;

            const styles = {
                green: "bg-green-500/10 text-green-700 border-green-200",
                yellow: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
                red: "bg-red-500/10 text-red-700 border-red-200",
            }[color];

            return <Badge className={styles} variant="outline">{label}</Badge>
        }
    },
    {
        id: "sessions",
        header: "Sesiones",
        cell: ({ row }) => {
            const badge = row.original.sessionsBadge;
            if (!badge) return <span className="text-muted-foreground text-xs">-</span>;

            return (
                <Badge
                    variant="outline"
                    className={`font-mono text-xs ${row.original.isOverLimit ? "border-amber-500 text-amber-600" : ""
                        }`}
                >
                    {badge}
                </Badge>
            )
        }
    },
    {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <div className="lowercase text-muted-foreground">{row.getValue("email") || "-"}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const athlete = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2 px-3 data-[state=open]:bg-muted">
                            <span className="text-xs font-medium">Gestionar</span>
                            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
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
