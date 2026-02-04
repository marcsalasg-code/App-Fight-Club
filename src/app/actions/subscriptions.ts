"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Expire subscriptions that have passed their end date.
 * This should be called by a cron job or on-demand.
 */
export async function expireSubscriptions() {
    const now = new Date();

    try {
        // Find and expire time-based subscriptions
        const expiredTimeBasedResult = await prisma.subscription.updateMany({
            where: {
                status: "ACTIVE",
                endDate: { lt: now },
            },
            data: { status: "EXPIRED" },
        });

        // Find and expire class-based subscriptions (classes used >= class count)
        const classBasedSubscriptions = await prisma.subscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: null, // Class-based don't have end date
            },
            include: { membership: true },
        });

        let expiredClassBased = 0;
        for (const sub of classBasedSubscriptions) {
            if (sub.membership.classCount && sub.classesUsed >= sub.membership.classCount) {
                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: "EXPIRED" },
                });
                expiredClassBased++;
            }
        }

        const totalExpired = expiredTimeBasedResult.count + expiredClassBased;

        console.log(`[Subscription Expiry] Expired ${totalExpired} subscriptions`);
        console.log(`  - Time-based: ${expiredTimeBasedResult.count}`);
        console.log(`  - Class-based: ${expiredClassBased}`);

        revalidatePath("/pagos");
        revalidatePath("/atletas");

        return {
            success: true,
            expired: totalExpired,
            details: {
                timeBased: expiredTimeBasedResult.count,
                classBased: expiredClassBased,
            },
        };
    } catch (error) {
        console.error("Error expiring subscriptions:", error);
        return { success: false, error: "Error al expirar suscripciones" };
    }
}

/**
 * Get subscriptions expiring soon (within next N days)
 */
export async function getExpiringSubscriptions(withinDays: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + withinDays);

    try {
        const expiring = await prisma.subscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: {
                    gte: now,
                    lte: futureDate,
                },
            },
            include: {
                athlete: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
                },
                membership: {
                    select: { name: true },
                },
            },
            orderBy: { endDate: "asc" },
        });

        return { success: true, data: expiring };
    } catch (error) {
        console.error("Error fetching expiring subscriptions:", error);
        return { success: false, error: "Error al obtener suscripciones por vencer" };
    }
}
