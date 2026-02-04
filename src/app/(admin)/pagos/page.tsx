import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
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
import { Plus, CreditCard, Settings, TrendingUp } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";

export const dynamic = 'force-dynamic';

async function getPaymentsStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthRevenue, lastMonthRevenue, recentPayments, pendingCount] =
        await Promise.all([
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { paymentDate: { gte: startOfMonth } },
            }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    paymentDate: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),
            prisma.payment.findMany({
                orderBy: { paymentDate: "desc" },
                take: 10,
                include: { athlete: true, subscription: { include: { membership: true } } },
            }),
            prisma.subscription.count({
                where: { status: "EXPIRED" },
            }),
        ]);

    return {
        thisMonth: thisMonthRevenue._sum.amount || 0,
        lastMonth: lastMonthRevenue._sum.amount || 0,
        recentPayments,
        pendingCount,
    };
}

const paymentMethodLabels: Record<string, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
};

export default async function PaymentsPage() {
    const stats = await getPaymentsStats();

    // Fetch data for export (last 1000 payments)
    const allPayments = await prisma.payment.findMany({
        orderBy: { paymentDate: "desc" },
        take: 1000,
        include: {
            athlete: true,
            subscription: { include: { membership: true } }
        },
    });

    const growth =
        stats.lastMonth > 0
            ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100
            : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Pagos</h1>
                    <p className="text-muted-foreground">
                        Gestiona los pagos y membresías
                    </p>
                </div>
                <div className="flex gap-2">
                    <ExportButton
                        data={allPayments.map(p => ({
                            athleteName: `${p.athlete.firstName} ${p.athlete.lastName}`,
                            amount: `€${p.amount.toFixed(2)}`,
                            method: paymentMethodLabels[p.paymentMethod] || p.paymentMethod,
                            date: p.paymentDate,
                            receipt: p.receiptNumber,
                            membership: p.subscription?.membership.name || "-"
                        }))}
                        columns={[
                            { header: "Atleta", key: "athleteName" },
                            { header: "Membresía", key: "membership" },
                            { header: "Monto", key: "amount" },
                            { header: "Método", key: "method" },
                            { header: "Fecha", key: "date" },
                            { header: "Recibo", key: "receipt" },
                        ]}
                        fileName="reporte_pagos"
                        title="Historial de Pagos"
                    />
                    <Link href="/pagos/membresias">
                        <Button variant="outline" size="icon" title="Configurar Membresías">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/pagos/nuevo">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Nuevo Pago</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ingresos del Mes
                        </CardTitle>
                        <CreditCard className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{stats.thisMonth.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {growth >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                            )}
                            {growth.toFixed(1)}% vs mes anterior
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Mes Anterior
                        </CardTitle>
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{stats.lastMonth.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Suscripciones Vencidas
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className={
                                stats.pendingCount > 0
                                    ? "bg-red-500/10 text-red-700"
                                    : "bg-green-500/10 text-green-700"
                            }
                        >
                            {stats.pendingCount}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {stats.pendingCount > 0
                                ? "Atletas con pagos pendientes"
                                : "Todos los pagos al día"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <CardTitle>Pagos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.recentPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                No hay pagos registrados
                            </p>
                            <Link href="/pagos/nuevo">
                                <Button>Registrar primer pago</Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Atleta</TableHead>
                                    <TableHead>Membresía</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Recibo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            <Link
                                                href={`/atletas/${payment.athleteId}`}
                                                className="hover:underline font-medium"
                                            >
                                                {payment.athlete.firstName} {payment.athlete.lastName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {payment.subscription?.membership.name || "-"}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            €{payment.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {paymentMethodLabels[payment.paymentMethod] ||
                                                    payment.paymentMethod}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(payment.paymentDate).toLocaleDateString("es-ES")}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {payment.receiptNumber}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
