"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPatterns() {
    try {
        const patterns = await prisma.classPattern.findMany({
            orderBy: { startTime: "asc" },
        });
        return { success: true, data: patterns };
    } catch (error) {
        console.error("Error getting patterns:", error);
        return { success: false, error: "Error al obtener horarios" };
    }
}

export async function createPattern(data: {
    name: string;
    type: string;
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    maxCapacity: number;
    color: string;
}) {
    try {
        const pattern = await prisma.classPattern.create({
            data: {
                ...data,
                daysOfWeek: data.daysOfWeek,
            },
        });
        revalidatePath("/configuracion/horarios");
        return { success: true, data: pattern };
    } catch (error) {
        console.error("Error creating pattern:", error);
        return { success: false, error: "Error al crear horario" };
    }
}

export async function deletePattern(id: string) {
    try {
        await prisma.classPattern.delete({ where: { id } });
        revalidatePath("/configuracion/horarios");
        return { success: true };
    } catch (error) {
        console.error("Error deleting pattern:", error);
        return { success: false, error: "Error al eliminar horario" };
    }
}

// Applies a pattern to the Class table (Creates Weekly Slots)
export async function applyPatternToSchedule(patternId: string) {
    try {
        const pattern = await prisma.classPattern.findUnique({
            where: { id: patternId },
        });

        if (!pattern) return { success: false, error: "Horario no encontrado" };

        let createdCount = 0;
        let skippedCount = 0;

        for (const day of pattern.daysOfWeek) {
            // Check if class exists already for this slot
            // Criteria: Same Name, Same Day, Same Start Time
            const existing = await prisma.class.findFirst({
                where: {
                    name: pattern.name,
                    dayOfWeek: day,
                    startTime: pattern.startTime,
                    active: true,
                }
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            // Create the class slot
            await prisma.class.create({
                data: {
                    name: pattern.name,
                    type: pattern.type,
                    dayOfWeek: day,
                    startTime: pattern.startTime,
                    endTime: pattern.endTime,
                    maxCapacity: pattern.maxCapacity,
                    color: pattern.color,
                    active: true,
                    levelRequired: pattern.levelRequired,
                }
            });
            createdCount++;
        }

        revalidatePath("/calendario");
        revalidatePath("/configuracion/horarios");
        return { success: true, created: createdCount, skipped: skippedCount };
    } catch (error) {
        console.error("Error applying pattern:", error);
        return { success: false, error: "Error al aplicar horario" };
    }
}
