"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { membershipSchema, paymentSchema, validateData } from "@/lib/schemas";

export type MembershipFormData = {
    name: string;
    price: number;
    durationDays?: number;
    classCount?: number;
    weeklyLimit?: number;
    description?: string;
};

export type PaymentFormData = {
    athleteId: string;
    membershipId: string;
    amount: number;
    paymentMethod: string;
    startDate?: string; // New field (ISO string)
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
                weeklyLimit: data.weeklyLimit || null,
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
                weeklyLimit: data.weeklyLimit || null,
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

        const now = new Date();
        let startDate: Date;

        // Custom Start Date Logic
        if (data.startDate) {
            startDate = new Date(data.startDate);
        } else {
            // Default Fallback Logic
            // Check for existing active subscription to extend? 
            // For simplicity in this new model, if no date provided, we default to TODAY (Rolling)
            // unless active subscription exists, then we extend.

            const activeSubscription = await prisma.subscription.findFirst({
                where: {
                    athleteId: data.athleteId,
                    status: "ACTIVE",
                },
                orderBy: { endDate: "desc" },
            });

            if (activeSubscription && activeSubscription.endDate && activeSubscription.endDate > now) {
                startDate = new Date(activeSubscription.endDate);
                startDate.setDate(startDate.getDate() + 1);
            } else {
                startDate = now;
            }
        }

        // Ensure time is start of day
        startDate.setHours(0, 0, 0, 0);

        let endDate: Date | null = null;

        if (membership.durationDays) {
            // Calculate endDate based on durationDays exactly
            const durationMs = membership.durationDays * 24 * 60 * 60 * 1000;
            // Subtract 1 second to land on 23:59:59 of the last day
            endDate = new Date(startDate.getTime() + durationMs - 1000);
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
                classesUsed: 0 // Reset usage for new sub
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

export async function voidPayment(paymentId: string, reason?: string) {
    if (!paymentId) {
        return { success: false, error: "ID de pago requerido" };
    }

    try {
        // Find the payment
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { subscription: true }
        });

        if (!payment) {
            return { success: false, error: "Pago no encontrado" };
        }

        if (payment.status === "VOID") {
            return { success: false, error: "Este pago ya está anulado" };
        }

        // Void the payment
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: "VOID",
                voidReason: reason || "Anulado por el administrador",
                voidedAt: new Date(),
            }
        });

        // If there's a linked subscription, deactivate it
        if (payment.subscriptionId) {
            await prisma.subscription.update({
                where: { id: payment.subscriptionId },
                data: { status: "CANCELLED" }
            });
        }

        revalidatePath("/pagos");
        revalidatePath("/atletas");
        revalidatePath(`/atletas/${payment.athleteId}`);

        return { success: true };
    } catch (error) {
        console.error("Error voiding payment:", error);
        return { success: false, error: "Error al anular el pago" };
    }
}

