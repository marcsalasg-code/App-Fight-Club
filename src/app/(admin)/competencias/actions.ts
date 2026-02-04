"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { competitionSchema, validateData } from "@/lib/schemas";

export type CompetitionFormData = {
    athleteId: string;
    eventName: string;
    date: string;
    result?: string;
    category?: string;
    weight?: number;
    notes?: string;
};

export async function createCompetition(data: CompetitionFormData) {
    // Validate input
    const validation = validateData(competitionSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        // Verify athlete exists and is a competitor
        const athlete = await prisma.athlete.findUnique({ where: { id: data.athleteId } });
        if (!athlete) {
            return { success: false, error: "Atleta no encontrado" };
        }
        if (!athlete.isCompetitor) {
            return { success: false, error: "El atleta no está marcado como competidor" };
        }

        await prisma.competition.create({
            data: {
                athleteId: data.athleteId,
                eventName: data.eventName,
                date: new Date(data.date),
                result: data.result || "PENDING",
                category: data.category || null,
                weight: data.weight || null,
                notes: data.notes || null,
            },
        });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error creating competition:", error);
        return { success: false, error: "Error al crear la competencia" };
    }
}

export async function updateCompetition(id: string, data: CompetitionFormData) {
    if (!id) return { success: false, error: "ID requerido" };

    const validation = validateData(competitionSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        await prisma.competition.update({
            where: { id },
            data: {
                athleteId: data.athleteId,
                eventName: data.eventName,
                date: new Date(data.date),
                result: data.result || "PENDING",
                category: data.category || null,
                weight: data.weight || null,
                notes: data.notes || null,
            },
        });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error updating competition:", error);
        return { success: false, error: "Error al actualizar la competencia" };
    }
}

export async function deleteCompetition(id: string) {
    if (!id) return { success: false, error: "ID requerido" };

    try {
        await prisma.competition.delete({ where: { id } });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error deleting competition:", error);
        return { success: false, error: "Error al eliminar la competencia" };
    }
}

export async function getCompetitorAthletes() {
    try {
        const athletes = await prisma.athlete.findMany({
            where: { isCompetitor: true, status: "ACTIVE" },
            orderBy: { firstName: "asc" },
            select: { id: true, firstName: true, lastName: true, competitionCategory: true },
        });
        return { success: true, data: athletes };
    } catch (error) {
        console.error("Error fetching competitors:", error);
        return { success: false, error: "Error al obtener competidores" };
    }
}
