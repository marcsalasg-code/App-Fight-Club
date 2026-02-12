"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { coachSchema, validateData } from "@/lib/schemas";
import { requireAdmin, requireRole } from "@/lib/safe-action";

export type CoachFormData = {
    name: string;
    email: string;
    pin?: string;
    role?: string;
};

export async function getCoaches() {
    await requireRole(["ADMIN", "COACH"]);
    try {
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
        return { success: true, data: coaches };
    } catch (error) {
        console.error("Error fetching coaches:", error);
        return { success: false, error: "Error al obtener entrenadores" };
    }
}

export async function getCoach(id: string) {
    await requireRole(["ADMIN", "COACH"]);
    try {
        const coach = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
                classes: {
                    select: { id: true, name: true, dayOfWeek: true, startTime: true },
                    where: { active: true },
                },
            },
        });
        if (!coach) {
            return { success: false, error: "Entrenador no encontrado" };
        }
        return { success: true, data: coach };
    } catch (error) {
        console.error("Error fetching coach:", error);
        return { success: false, error: "Error al obtener entrenador" };
    }
}

export async function createCoach(data: CoachFormData) {
    await requireAdmin();

    const validation = validateData(coachSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return { success: false, error: "Este email ya está registrado" };
        }

        const pin = data.pin || "1234"; // Default PIN
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(pin, 10);

        const coach = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role || "COACH",
            },
        });

        revalidatePath("/configuracion/entrenadores");
        return { success: true, data: { id: coach.id, name: coach.name, email: coach.email } };
    } catch (error) {
        console.error("Error creating coach:", error);
        return { success: false, error: "Error al crear entrenador" };
    }
}

export async function updateCoach(id: string, data: CoachFormData) {
    await requireAdmin();

    if (!id) return { success: false, error: "ID requerido" };

    const updateSchema = coachSchema.extend({
        pin: coachSchema.shape.pin.optional(),
    });
    const validation = validateData(updateSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        const existing = await prisma.user.findFirst({
            where: { email: data.email, id: { not: id } },
        });
        if (existing) {
            return { success: false, error: "Este email ya está registrado" };
        }

        const updateData: Record<string, unknown> = {
            name: data.name,
            email: data.email,
            role: data.role || "COACH",
        };

        if (data.pin) {
            const bcrypt = await import("bcryptjs");
            updateData.password = await bcrypt.hash(data.pin, 10);
        }

        const coach = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/configuracion/entrenadores");
        return { success: true, data: { id: coach.id, name: coach.name } };
    } catch (error) {
        console.error("Error updating coach:", error);
        return { success: false, error: "Error al actualizar entrenador" };
    }
}

export async function assignCoachesToClasses(
    coachId: string,
    filters: {
        days: string[];
        startTime?: string;
        endTime?: string;
        type?: string;
    }
) {
    await requireAdmin();

    if (!coachId || filters.days.length === 0) {
        return { success: false, error: "Faltan datos requeridos (Entrenador o Días)" };
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {
            dayOfWeek: { in: filters.days },
            active: true,
        };

        if (filters.startTime) {
            whereClause.startTime = { gte: filters.startTime };
        }
        if (filters.endTime) {
            whereClause.endTime = { lte: filters.endTime };
        }
        if (filters.type && filters.type !== "ALL") {
            whereClause.type = filters.type;
        }

        const classesToUpdate = await prisma.class.findMany({
            where: whereClause,
            select: { id: true }
        });

        if (classesToUpdate.length === 0) {
            return { success: false, error: "No se encontraron clases con estos filtros" };
        }

        const updatePromises = classesToUpdate.map(cls =>
            prisma.class.update({
                where: { id: cls.id },
                data: {
                    coaches: {
                        connect: { id: coachId }
                    }
                }
            })
        );

        await prisma.$transaction(updatePromises);

        revalidatePath("/clases");
        revalidatePath("/calendario");
        revalidatePath("/configuracion/entrenadores");

        return { success: true, count: classesToUpdate.length };
    } catch (error) {
        console.error("Error doing bulk assignment:", error);
        return { success: false, error: "Error al asignar clases masivamente" };
    }
}

export async function deleteCoach(id: string) {
    await requireAdmin();

    if (!id) return { success: false, error: "ID requerido" };

    try {
        const classCount = await prisma.class.count({
            where: {
                coaches: { some: { id } }
            }
        });
        if (classCount > 0) {
            await prisma.user.update({
                where: { id },
                data: { active: false },
            });
        } else {
            await prisma.user.delete({ where: { id } });
        }

        revalidatePath("/configuracion/entrenadores");
        return { success: true };
    } catch (error) {
        console.error("Error deleting coach:", error);
        return { success: false, error: "Error al eliminar entrenador" };
    }
}

export async function getCoachesForSelect() {
    await requireRole(["ADMIN", "COACH"]);
    try {
        const coaches = await prisma.user.findMany({
            where: { active: true },
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        });
        return coaches;
    } catch (error) {
        console.error("Error fetching coaches for select:", error);
        return [];
    }
}
