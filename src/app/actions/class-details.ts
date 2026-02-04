"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClassDetails(classId: string) {
    try {
        const cls = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                coaches: { select: { id: true, name: true } },
                attendances: {
                    include: {
                        athlete: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                photoUrl: true,
                            }
                        }
                    },
                    orderBy: { checkInTime: 'desc' }
                }
            }
        });

        if (!cls) return { success: false, error: "Clase no encontrada" };

        return { success: true, data: cls };
    } catch (error) {
        console.error("Error fetching class details:", error);
        return { success: false, error: "Error al cargar detalles" };
    }
}

export async function cancelClass(classId: string) {
    try {
        // Delete all attendances first
        await prisma.attendance.deleteMany({
            where: { classId }
        });

        // Deactivate the class (soft delete)
        await prisma.class.update({
            where: { id: classId },
            data: { active: false }
        });

        revalidatePath('/calendario');
        return { success: true, message: "Clase cancelada exitosamente" };
    } catch (error) {
        console.error("Error canceling class:", error);
        return { success: false, error: "Error al cancelar la clase" };
    }
}

export async function addManualAttendance(classId: string, athleteId: string) {
    try {
        // Check if already registered today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await prisma.attendance.findFirst({
            where: {
                classId,
                athleteId,
                date: { gte: today }
            }
        });

        if (existing) {
            return { success: false, error: "El atleta ya está registrado en esta clase" };
        }

        await prisma.attendance.create({
            data: {
                classId,
                athleteId,
                date: new Date(),
                checkInTime: new Date(),
                method: 'MANUAL'
            }
        });

        revalidatePath('/calendario');
        return { success: true, message: "Asistencia registrada" };
    } catch (error) {
        console.error("Error adding manual attendance:", error);
        return { success: false, error: "Error al registrar asistencia" };
    }
}

export async function getActiveAthletes() {
    try {
        const athletes = await prisma.athlete.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                photoUrl: true
            },
            orderBy: { firstName: 'asc' }
        });
        return { success: true, data: athletes };
    } catch (error) {
        console.error("Error fetching athletes:", error);
        return { success: false, error: "Error al cargar atletas" };
    }
}
