"use server";

import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function exportPaymentsCSV(month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth();
    const targetYear = year ?? now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const payments = await prisma.payment.findMany({
        where: {
            paymentDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            athlete: {
                select: { firstName: true, lastName: true },
            },
            subscription: {
                include: { membership: true },
            },
        },
        orderBy: { paymentDate: "desc" },
    });

    // Build CSV
    const headers = ["Fecha", "Atleta", "Monto", "Método", "Tipo Membresía", "Descripción"];
    const rows = payments.map((p) => [
        format(p.paymentDate, "dd/MM/yyyy", { locale: es }),
        `${p.athlete.firstName} ${p.athlete.lastName}`,
        p.amount.toFixed(2),
        p.paymentMethod,
        p.subscription?.membership?.name || "N/A",
        p.notes || "",
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
    ].join("\n");

    const monthName = format(startDate, "MMMM_yyyy", { locale: es });

    return {
        content: csvContent,
        filename: `pagos_${monthName}.csv`,
    };
}
