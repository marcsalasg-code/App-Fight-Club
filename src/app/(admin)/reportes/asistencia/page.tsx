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
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

async function getAttendanceReport() {
    // Fetch last 500 attendance records
    const attendance = await prisma.attendance.findMany({
        take: 500,
        orderBy: { date: "desc" },
        include: {
            athlete: true,
            class: true,
        },
    });

    return attendance;
}

export default async function AttendanceReportPage() {
    const attendance = await getAttendanceReport();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Reporte de Asistencia</h1>
                    <p className="text-muted-foreground">
                        Historial de check-ins y asistencias
                    </p>
                </div>
                <div>
                    <ExportButton
                        data={attendance.map(a => ({
                            athleteName: `${a.athlete.firstName} ${a.athlete.lastName}`,
                            className: a.class?.name || "Clase eliminada",
                            date: a.date,
                            checkInTime: a.checkInTime ? format(a.checkInTime, "HH:mm:ss") : "-",
                            method: a.method === "QR" ? "QR Code" : "Manual"
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
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Últimas 500 Asistencias</CardTitle>
                </CardHeader>
                <CardContent>
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
                                        {format(record.date, "PPP", { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/atletas/${record.athleteId}`} className="hover:underline font-medium">
                                            {record.athlete.firstName} {record.athlete.lastName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {record.class ? (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: record.class.color || "#000" }}
                                                />
                                                {record.class.name}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic">Eliminado</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {record.checkInTime ? format(record.checkInTime, "HH:mm") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {record.method === "QR" ? "QR Code" : "Manual"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
