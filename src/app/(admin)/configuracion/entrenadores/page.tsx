import prisma from "@/lib/prisma";
import { CoachesClient } from "./coaches-client";
import { getCoachWeeklyCount } from "@/actions/schedule";

export const dynamic = "force-dynamic";

export default async function CoachesPage() {
    const coaches = await prisma.user.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: { select: { classes: true } },
        },
    });

    const coachesWithWeekly = await Promise.all(coaches.map(async (coach) => {
        const weeklyCount = await getCoachWeeklyCount(coach.id);
        return {
            ...coach,
            createdAt: coach.createdAt.toISOString(),
            weeklyCount,
        };
    }));

    return <CoachesClient initialCoaches={coachesWithWeekly} />;
}
