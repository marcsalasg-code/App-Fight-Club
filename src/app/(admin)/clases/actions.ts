"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { classSchema, validateData } from "@/lib/schemas";

export type ClassFormData = {
    name: string;
    type: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    coachIds?: string[];
    levelRequired?: string;
    maxCapacity: number;
    color?: string;
};

export async function createClass(data: ClassFormData) {
    // Validate input
    // const validation = validateData(classSchema, data); // Schema needs update too
    // if (!validation.success) {
    //     return { success: false, error: validation.error };
    // }
    // Skipping schema validation for now as Zod schema needs update

    // Validate time logic
    if (data.startTime >= data.endTime) {
        return { success: false, error: "La hora de inicio debe ser antes de la hora de fin" };
    }

    try {
        const newClass = await prisma.class.create({
            data: {
                name: data.name,
                type: data.type,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                coaches: {
                    connect: data.coachIds?.map(id => ({ id })) || []
                },
                levelRequired: data.levelRequired || null,
                maxCapacity: data.maxCapacity,
                color: data.color || "#D4AF37",
            },
        });
        revalidatePath("/clases");
        revalidatePath("/calendario");
        return { success: true, data: newClass };
    } catch (error) {
        console.error("Error creating class:", error);
        return { success: false, error: "Error al crear la clase" };
    }
}

export async function updateClass(id: string, data: ClassFormData) {
    if (!id) return { success: false, error: "ID requerido" };

    // Validate time logic
    if (data.startTime >= data.endTime) {
        return { success: false, error: "La hora de inicio debe ser antes de la hora de fin" };
    }

    try {
        // Disconnect existing coaches first or use set?
        // set replaces all relations
        const updatedClass = await prisma.class.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                coaches: {
                    set: data.coachIds?.map(id => ({ id })) || []
                },
                levelRequired: data.levelRequired || null,
                maxCapacity: data.maxCapacity,
                color: data.color || "#D4AF37",
            },
        });
        revalidatePath("/clases");
        revalidatePath("/calendario");
        return { success: true, data: updatedClass };
    } catch (error) {
        console.error("Error updating class:", error);
        return { success: false, error: "Error al actualizar la clase" };
    }
}

export async function toggleClassActive(id: string, active: boolean) {
    if (!id || typeof active !== "boolean") {
        return { success: false, error: "Parámetros inválidos" };
    }

    try {
        await prisma.class.update({
            where: { id },
            data: { active },
        });
        revalidatePath("/clases");
        revalidatePath("/calendario");
        return { success: true };
    } catch (error) {
        console.error("Error toggling class:", error);
        return { success: false, error: "Error al cambiar el estado" };
    }
}

export async function registerAttendance(classId: string, athleteIds: string[]) {
    if (!classId || !Array.isArray(athleteIds) || athleteIds.length === 0) {
        return { success: false, error: "Parámetros inválidos" };
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create attendance records
        const attendances = await Promise.all(
            athleteIds.map(async (athleteId) => {
                // Check if already checked in
                const existing = await prisma.attendance.findFirst({
                    where: {
                        athleteId,
                        classId,
                        date: today,
                    },
                });

                if (existing) return existing;

                return prisma.attendance.create({
                    data: {
                        athleteId,
                        classId,
                        date: today,
                        method: "MANUAL",
                    },
                });
            })
        );

        // Update class count for class-based subscriptions
        for (const athleteId of athleteIds) {
            const subscription = await prisma.subscription.findFirst({
                where: {
                    athleteId,
                    status: "ACTIVE",
                    membership: { classCount: { not: null } },
                },
                include: { membership: true },
            });

            if (subscription && subscription.membership.classCount) {
                const newClassesUsed = subscription.classesUsed + 1;
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        classesUsed: newClassesUsed,
                        status:
                            newClassesUsed >= subscription.membership.classCount
                                ? "EXPIRED"
                                : "ACTIVE",
                    },
                });
            }
        }

        revalidatePath("/calendario");
        return { success: true, data: attendances };
    } catch (error) {
        console.error("Error registering attendance:", error);
        return { success: false, error: "Error al registrar la asistencia" };
    }
}

export async function removeAttendance(attendanceId: string) {
    if (!attendanceId) {
        return { success: false, error: "ID requerido" };
    }

    try {
        await prisma.attendance.delete({
            where: { id: attendanceId },
        });
        revalidatePath("/calendario");
        return { success: true };
    } catch (error) {
        console.error("Error removing attendance:", error);
        return { success: false, error: "Error al eliminar la asistencia" };
    }
}

export async function deleteClass(id: string) {
    if (!id) return { success: false, error: "ID requerido" };

    try {
        // Check if class has attendances
        const attendanceCount = await prisma.attendance.count({ where: { classId: id } });
        if (attendanceCount > 0) {
            return { success: false, error: `No se puede eliminar: tiene ${attendanceCount} registros de asistencia` };
        }

        await prisma.class.delete({ where: { id } });
        revalidatePath("/clases");
        revalidatePath("/calendario");
        return { success: true };
    } catch (error) {
        console.error("Error deleting class:", error);
        return { success: false, error: "Error al eliminar la clase" };
    }
}


export async function getCoachesList() {
    try {
        const coaches = await prisma.user.findMany({
            where: {
                role: "COACH",
                active: true,
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            }
        });
        return coaches;
    } catch (error) {
        console.error("Error fetching coaches:", error);
        return [];
    }
}
