import prisma from "@/lib/prisma";
import { CoachesClient } from "./coaches-client";

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

    return <CoachesClient initialCoaches={coaches} />;
}
