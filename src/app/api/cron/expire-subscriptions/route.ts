import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Secret key to verify cron requests (set in Vercel)
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    // Verify authorization for cron jobs
    const authHeader = request.headers.get("authorization");

    // In production, require CRON_SECRET
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    try {
        // 1. Expire time-based subscriptions
        const expiredTimeBased = await prisma.subscription.updateMany({
            where: {
                status: "ACTIVE",
                // Expire if endDate < now - 5 days
                endDate: {
                    lt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
                },
            },
            data: { status: "EXPIRED" },
        });

        // 2. Expire class-based subscriptions
        const classBasedSubscriptions = await prisma.subscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: null,
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

        // 3. Optional: Update athlete status if no active subscriptions
        // This marks athletes as INACTIVE if they have no active subscription
        const athletesWithExpiredSubs = await prisma.athlete.findMany({
            where: {
                status: "ACTIVE",
                subscriptions: {
                    none: { status: "ACTIVE" },
                },
            },
            select: { id: true },
        });

        // Note: Uncomment below to auto-inactivate athletes without subscriptions
        // await prisma.athlete.updateMany({
        //     where: { id: { in: athletesWithExpiredSubs.map(a => a.id) } },
        //     data: { status: "INACTIVE" },
        // });

        const result = {
            success: true,
            timestamp: now.toISOString(),
            expired: {
                timeBased: expiredTimeBased.count,
                classBased: expiredClassBased,
                total: expiredTimeBased.count + expiredClassBased,
            },
            athletesWithoutSubscription: athletesWithExpiredSubs.length,
        };

        console.log("[CRON] Subscription expiration completed:", result);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[CRON] Error expiring subscriptions:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
