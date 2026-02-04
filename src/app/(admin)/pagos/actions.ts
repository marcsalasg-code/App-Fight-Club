"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { membershipSchema, paymentSchema, validateData } from "@/lib/schemas";

export type MembershipFormData = {
    name: string;
    price: number;
    durationDays?: number;
    classCount?: number;
    description?: string;
};

export type PaymentFormData = {
    athleteId: string;
    membershipId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
};

export async function createMembership(data: MembershipFormData) {
    // Validate input
    const validation = validateData(membershipSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        const membership = await prisma.membership.create({
            data: {
                name: data.name,
                price: data.price,
                durationDays: data.durationDays || null,
                classCount: data.classCount || null,
                description: data.description || null,
            },
        });
        revalidatePath("/pagos");
        revalidatePath("/pagos/membresias");
        return { success: true, data: membership };
    } catch (error) {
        console.error("Error creating membership:", error);
        return { success: false, error: "Error al crear la membresía" };
    }
}

export async function updateMembership(id: string, data: MembershipFormData) {
    if (!id) return { success: false, error: "ID requerido" };

    const validation = validateData(membershipSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        const membership = await prisma.membership.update({
            where: { id },
            data: {
                name: data.name,
                price: data.price,
                durationDays: data.durationDays || null,
                classCount: data.classCount || null,
                description: data.description || null,
            },
        });
        revalidatePath("/pagos");
        revalidatePath("/pagos/membresias");
        return { success: true, data: membership };
    } catch (error) {
        console.error("Error updating membership:", error);
        return { success: false, error: "Error al actualizar la membresía" };
    }
}

export async function deleteMembership(id: string) {
    if (!id) return { success: false, error: "ID requerido" };

    try {
        await prisma.membership.update({
            where: { id },
            data: { active: false },
        });
        revalidatePath("/pagos/membresias");
        return { success: true };
    } catch (error) {
        console.error("Error deleting membership:", error);
        return { success: false, error: "Error al eliminar la membresía" };
    }
}

export async function registerPayment(data: PaymentFormData) {
    // Validate input
    const validation = validateData(paymentSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        // Verify athlete exists
        const athlete = await prisma.athlete.findUnique({ where: { id: data.athleteId } });
        if (!athlete) {
            return { success: false, error: "Atleta no encontrado" };
        }

        // Get the membership
        const membership = await prisma.membership.findUnique({
            where: { id: data.membershipId },
        });

        if (!membership) {
            return { success: false, error: "Membresía no encontrada" };
        }

        // Check for existing active subscription
        const activeSubscription = await prisma.subscription.findFirst({
            where: {
                athleteId: data.athleteId,
                status: "ACTIVE",
            },
            orderBy: { endDate: "desc" },
        });

        const now = new Date();
        let startDate = now;
        let endDate: Date | null = null;

        // Advance Payment Logic
        if (activeSubscription && activeSubscription.endDate && activeSubscription.endDate > now) {
            // If active subscription exists and extends into future, start next day
            startDate = new Date(activeSubscription.endDate);
            startDate.setDate(startDate.getDate() + 1);
        } else {
            // If no active subscription (or it's expired), align to 1st of CURRENT month
            // This assumes "paying for the month" regardless of current day.
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Ensure time is start of day
        startDate.setHours(0, 0, 0, 0);

        if (membership.durationDays) {
            // Calendar Month Alignment
            // We set endDate to the last day of the month of the startDate.
            // Even if startDate is Mar 1, endDate is Mar 31.
            // If durationDays would imply multi-month (e.g. 90 days), we should handle that.
            // But for now, assuming standard monthly (durationDays ~ 30).

            // Calculate End of Month based on startDate
            // new Date(year, month + 1, 0) gives last day of 'month'.
            // month is 0-indexed. 
            // If Start is Feb 1 (Month 1). We want End of Feb.
            // new Date(Year, 2, 0) -> Day 0 of Month 2 (March) -> Last Day of Feb. Correct.

            const desiredMonths = Math.round(membership.durationDays / 30);
            const monthsToAdd = desiredMonths > 0 ? desiredMonths : 1;

            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthsToAdd, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        // Create subscription
        const subscription = await prisma.subscription.create({
            data: {
                athleteId: data.athleteId,
                membershipId: data.membershipId,
                startDate,
                endDate,
                status: "ACTIVE",
            },
        });

        // Create payment
        const payment = await prisma.payment.create({
            data: {
                athleteId: data.athleteId,
                subscriptionId: subscription.id,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                periodStart: startDate,
                periodEnd: endDate,
                notes: data.notes || null,
                receiptNumber: `REC-${Date.now()}`,
            },
        });

        revalidatePath("/pagos");
        revalidatePath("/atletas");
        revalidatePath(`/atletas/${data.athleteId}`);

        return { success: true, data: { payment, subscription } };
    } catch (error) {
        console.error("Error registering payment:", error);
        return { success: false, error: "Error al registrar el pago" };
    }
}
