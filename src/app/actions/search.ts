"use server";

import prisma from "@/lib/prisma";

export type SearchResult = {
    athletes: { id: string; name: string; email: string | null }[];
    classes: { id: string; name: string; dayOfWeek: string; startTime: string }[];
};

export async function searchGlobal(query: string): Promise<SearchResult> {
    if (!query || query.length < 2) {
        return { athletes: [], classes: [] };
    }

    const [athletesRaw, classes] = await Promise.all([
        prisma.athlete.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                ],
            },
            select: { id: true, firstName: true, lastName: true, email: true },
            take: 5,
        }),
        prisma.class.findMany({
            where: {
                name: { contains: query, mode: "insensitive" },
                active: true,
            },
            select: { id: true, name: true, dayOfWeek: true, startTime: true },
            take: 5,
        }),
    ]);

    // Transform athletes to have a combined "name" field
    const athletes = athletesRaw.map((a) => ({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`,
        email: a.email,
    }));

    return { athletes, classes };
}
