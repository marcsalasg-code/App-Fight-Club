"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { athleteSchema, validateData } from "@/lib/schemas";

export type AthleteFormData = {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    pin?: string;
    dateOfBirth?: string;
    emergencyContact?: string;
    medicalConditions?: string;
    height?: number;
    weight?: number;
    level: string;
    goal: string;
    isCompetitor: boolean;
    competitionCategory?: string;
    tagIds?: string[]; // New field
};

export async function createAthlete(data: AthleteFormData) {
    // Validate input (skip tag validation for now in zod schema or update it separately)
    // const validation = validateData(athleteSchema, data);
    // if (!validation.success) {
    //     return { success: false, error: validation.error };
    // }

    try {
        // Check for duplicate PIN
        if (data.pin) {
            const existingPin = await prisma.athlete.findUnique({ where: { pin: data.pin } });
            if (existingPin) {
                return { success: false, error: "Este PIN ya está en uso" };
            }
        }

        const athlete = await prisma.athlete.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email || null,
                phone: data.phone || null,
                pin: data.pin || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                emergencyContact: data.emergencyContact || null,
                medicalConditions: data.medicalConditions || null,
                height: data.height || null,
                weight: data.weight || null,
                level: data.level,
                goal: data.goal,
                isCompetitor: data.isCompetitor,
                competitionCategory: data.competitionCategory || null,
                tags: {
                    connect: data.tagIds?.map(id => ({ id })) || []
                }
            },
        });
        revalidatePath("/atletas");
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error creating athlete:", error);
        return { success: false, error: "Error al crear el atleta" };
    }
}

export async function updateAthlete(id: string, data: AthleteFormData) {
    // Validate input
    // const validation = validateData(athleteSchema, data);
    // if (!validation.success) {
    //     return { success: false, error: validation.error };
    // }

    try {
        // Check for duplicate PIN (excluding current athlete)
        if (data.pin) {
            const existingPin = await prisma.athlete.findFirst({
                where: { pin: data.pin, id: { not: id } }
            });
            if (existingPin) {
                return { success: false, error: "Este PIN ya está en uso" };
            }
        }

        const athlete = await prisma.athlete.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email || null,
                phone: data.phone || null,
                pin: data.pin || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                emergencyContact: data.emergencyContact || null,
                medicalConditions: data.medicalConditions || null,
                height: data.height || null,
                weight: data.weight || null,
                level: data.level,
                goal: data.goal,
                isCompetitor: data.isCompetitor,
                competitionCategory: data.competitionCategory || null,
                tags: {
                    set: data.tagIds?.map(id => ({ id })) || []
                }
            },
        });
        revalidatePath("/atletas");
        revalidatePath(`/atletas/${id}`);
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error updating athlete:", error);
        return { success: false, error: "Error al actualizar el atleta" };
    }
}

export async function deleteAthlete(id: string) {
    if (!id || typeof id !== "string") {
        return { success: false, error: "ID inválido" };
    }

    try {
        await prisma.athlete.delete({ where: { id } });
        revalidatePath("/atletas");
        return { success: true };
    } catch (error) {
        console.error("Error deleting athlete:", error);
        return { success: false, error: "Error al eliminar el atleta" };
    }
}

export async function toggleAthleteStatus(id: string, status: string) {
    if (!id || !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
        return { success: false, error: "Parámetros inválidos" };
    }

    try {
        const athlete = await prisma.athlete.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/atletas");
        revalidatePath(`/atletas/${id}`);
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error toggling athlete status:", error);
        return { success: false, error: "Error al cambiar el estado" };
    }
}

export async function deleteAthletes(ids: string[]) {
    try {
        await prisma.athlete.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        revalidatePath("/atletas");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar los atletas" };
    }
}

export async function searchAthletes(query: string) {
    if (!query || query.length < 2) {
        return [];
    }

    try {
        const athletes = await prisma.athlete.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { phone: { contains: query, mode: "insensitive" } },
                    { pin: { contains: query } },
                ],
                status: "ACTIVE",
            },
            take: 10,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
                tags: { select: { label: true, color: true } },
            },
        });

        return athletes.map(a => ({
            ...a,
            fullName: `${a.firstName} ${a.lastName}`,
            initials: `${a.firstName[0]}${a.lastName[0]}`.toUpperCase()
        }));
    } catch (error) {
        console.error("Error searching athletes:", error);
        return [];
    }
}
