import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ExportButton } from "@/components/ui/export-button";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type Props = {
    searchParams: Promise<{ page?: string; from?: string; to?: string }>;
};

async function getAttendanceReport(page: number, from?: Date, to?: Date) {
    const where: Record<string, unknown> = {};

    if (from || to) {
        where.date = {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
        };
    }

    const [attendance, total] = await Promise.all([
        prisma.attendance.findMany({
            where,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            orderBy: { date: "desc" },
            include: {
                athlete: true,
                class: true,
            },
        }),
        prisma.attendance.count({ where }),
    ]);

    return { attendance, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function AttendanceReportPage({ searchParams }: Props) {
    const params = await searchParams;
    const page = Math.max(1, parseInt(params.page || "1"));

    // Default: last 30 days
    const fromDate = params.from
        ? startOfDay(new Date(params.from))
        : startOfDay(subDays(new Date(), 30));
    const toDate = params.to
        ? endOfDay(new Date(params.to))
        : endOfDay(new Date());

    const fromStr = format(fromDate, "yyyy-MM-dd");
    const toStr = format(toDate, "yyyy-MM-dd");

    const { attendance, total, totalPages } = await getAttendanceReport(
        page,
        fromDate,
        toDate
    );

    function buildUrl(p: number) {
        return `/reportes/asistencia?page=${p}&from=${fromStr}&to=${toStr}`;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Reporte de Asistencia"
                subtitle="Historial de check-ins y asistencias"
                action={
                    <ExportButton
                        data={attendance.map((a) => ({
                            athleteName: `${a.athlete.firstName} ${a.athlete.lastName}`,
                            className: a.class?.name || "Clase eliminada",
                            date: a.date,
                            checkInTime: a.checkInTime
                                ? format(a.checkInTime, "HH:mm:ss")
                                : "-",
                            method: a.method === "QR" ? "QR Code" : "Manual",
                        }))}
                        columns={[
                            { header: "Atleta", key: "athleteName" },
                            { header: "Clase", key: "className" },
                            { header: "Fecha", key: "date" },
                            { header: "Hora Check-in", key: "checkInTime" },
                            { header: "Método", key: "method" },
                        ]}
                        fileName="reporte_asistencia"
                        title="Reporte de Asistencia"
                    />
                }
            />

            {/* Date Filters */}
            <Card>
                <CardContent className="pt-6">
                    <form className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="grid gap-1.5 flex-1 w-full">
                            <label htmlFor="from" className="text-sm font-medium">
                                Desde
                            </label>
                            <input
                                type="date"
                                id="from"
                                name="from"
                                defaultValue={fromStr}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="grid gap-1.5 flex-1 w-full">
                            <label htmlFor="to" className="text-sm font-medium">
                                Hasta
                            </label>
                            <input
                                type="date"
                                id="to"
                                name="to"
                                defaultValue={toStr}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <Button type="submit" size="sm">
                            Filtrar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Asistencias</span>
                        <Badge variant="secondary">{total} registros</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {attendance.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No hay registros de asistencia en este período.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Atleta</TableHead>
                                    <TableHead>Clase</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Método</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendance.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            {format(record.date, "PPP", {
                                                locale: es,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/atletas/${record.athleteId}`}
                                                className="hover:underline font-medium"
                                            >
                                                {record.athlete.firstName}{" "}
                                                {record.athlete.lastName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {record.class ? (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                record.class
                                                                    .color ||
                                                                "#000",
                                                        }}
                                                    />
                                                    {record.class.name}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">
                                                    Eliminado
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {record.checkInTime
                                                ? format(
                                                    record.checkInTime,
                                                    "HH:mm"
                                                )
                                                : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {record.method === "QR"
                                                    ? "QR Code"
                                                    : "Manual"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-muted-foreground">
                                Página {page} de {totalPages}
                            </p>
                            <div className="flex gap-2">
                                {page > 1 && (
                                    <Link href={buildUrl(page - 1)}>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <ChevronLeft className="h-4 w-4" />
                                            Anterior
                                        </Button>
                                    </Link>
                                )}
                                {page < totalPages && (
                                    <Link href={buildUrl(page + 1)}>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            Siguiente
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
