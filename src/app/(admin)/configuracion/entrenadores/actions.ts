"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { coachSchema, validateData } from "@/lib/schemas";

export type CoachFormData = {
    name: string;
    email: string;
    password?: string;
    role?: string;
};

export async function getCoaches() {
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
    // Validate input
    const validation = validateData(coachSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        // Check for duplicate email
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return { success: false, error: "Este email ya está registrado" };
        }

        // In production, you'd hash the password
        const password = data.password || "temp123"; // Default temporary password

        const coach = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: password, // TODO: Hash in production
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
    if (!id) return { success: false, error: "ID requerido" };

    // Validate input (password optional for update)
    const updateSchema = coachSchema.extend({
        password: coachSchema.shape.password.optional(),
    });
    const validation = validateData(updateSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        // Check for duplicate email (excluding current coach)
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

        if (data.password) {
            updateData.password = data.password; // TODO: Hash in production
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

export async function deleteCoach(id: string) {
    if (!id) return { success: false, error: "ID requerido" };

    try {
        // Check if coach has classes
        const classCount = await prisma.class.count({
            where: {
                coaches: { some: { id } }
            }
        });
        if (classCount > 0) {
            // Soft delete - just deactivate
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
