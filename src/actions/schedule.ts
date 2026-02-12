"use server";

import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek, addDays, format, getDay, isSameDay } from "date-fns";
import { requireRole } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

const DAY_MAP: Record<number, string> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
};

/**
 * Get the full schedule for a date range, including substitutions.
 */
export async function getCalendarSchedule(startDate: Date, endDate: Date) {
    const start = startDate;
    const end = endDate;

    // 1. Fetch all Class Templates
    const classes = await prisma.class.findMany({
        where: { active: true },
        include: {
            coaches: { select: { id: true, name: true, role: true } },
        },
    });

    // 2. Fetch Substitutions in range
    const substitutions = await prisma.classCoachSubstitution.findMany({
        where: {
            date: {
                gte: start,
                lte: end,
            },
        },
        include: {
            newCoach: { select: { id: true, name: true, role: true } },
        },
    });

    // 3. Generate Calendar Instances
    const schedule = [];
    let current = start;

    while (current <= end) {
        const dayName = DAY_MAP[getDay(current)];
        const dateStr = format(current, "yyyy-MM-dd");

        // Find classes for this day of week
        const dayClasses = classes.filter(c => c.dayOfWeek === dayName);

        for (const cls of dayClasses) {
            // Check for override
            const override = substitutions.find(
                s => s.classId === cls.id && isSameDay(s.date, current)
            );

            // Determine effective coaches
            // If override exists, it replaces ALL original coaches? 
            // Or just adds/removes? 
            // Design decision: Substitution replaces the PRIMARY coach logic.
            // But Class can have multiple coaches. 
            // For simplicity in this iteration: If override exists, NEW COACH is the coach.
            // Use 'newCoach' from override if present, else use 'coaches' from template.

            let displayedCoaches = cls.coaches;
            let isSubstitute = false;

            if (override) {
                displayedCoaches = [override.newCoach];
                isSubstitute = true;
            }

            schedule.push({
                instanceId: `${cls.id}-${dateStr}`,
                classId: cls.id,
                date: current,
                name: cls.name,
                startTime: cls.startTime,
                endTime: cls.endTime,
                coaches: displayedCoaches,
                isSubstitute,
                overrideId: override?.id
            });
        }
        current = addDays(current, 1);
    }

    return schedule;
}

/**
 * Get accurate weekly class count for a coach.
 */
export async function getCoachWeeklyCount(coachId: string, referneceDate: Date = new Date()) {
    const start = startOfWeek(referneceDate, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(referneceDate, { weekStartsOn: 1 });

    const schedule = await getCalendarSchedule(start, end);

    return schedule.filter(s => s.coaches.some(c => c.id === coachId)).length;
}

/**
 * Assign a coach to a specific instance (Substitution).
 */
export async function assignCoachToInstance(classId: string, date: Date, coachId: string) {
    await requireRole(["ADMIN"]);

    try {
        // Upsert substitution
        // To update, we essentially replace the record for this class/date

        await prisma.classCoachSubstitution.upsert({
            where: {
                classId_date: {
                    classId,
                    date,
                }
            },
            create: {
                classId,
                date,
                newCoachId: coachId,
            },
            update: {
                newCoachId: coachId,
            }
        });

        revalidatePath("/configuracion/entrenadores");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Error al asignar sustitución" };
    }
}

/**
 * Remove substitution (Revert to Template).
 */
export async function removeSubstitution(classId: string, date: Date) {
    await requireRole(["ADMIN"]);

    try {
        await prisma.classCoachSubstitution.delete({
            where: {
                classId_date: {
                    classId,
                    date
                }
            }
        });
        revalidatePath("/configuracion/entrenadores");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar sustitución" };
    }
}
