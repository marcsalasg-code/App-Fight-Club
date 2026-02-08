"use server";

import prisma from "@/lib/prisma";

export type LoginUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null; // For future use
};

export async function getLoginUsers(): Promise<LoginUser[]> {
    try {
        const users = await prisma.user.findMany({
            where: {
                active: true,
                role: { in: ["ADMIN", "COACH"] }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                // avatar: true // if it existed
            },
            orderBy: {
                role: "asc" // Admin first usually, or name
            }
        });

        return users;
    } catch (error) {
        console.error("Error fetching login users:", error);
        return [];
    }
}
