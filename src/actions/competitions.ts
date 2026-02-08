"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { competitionSchema, eventSchema, validateData } from "@/lib/schemas";
import { requireRole } from "@/lib/safe-action";

export type CompetitionFormData = {
    athleteId: string;
    eventName: string;
    date: string;
    result?: string;
    category?: string;
    weight?: number;
    notes?: string;
    eventId?: string;
};

export async function createCompetition(data: CompetitionFormData) {
    await requireRole(["ADMIN", "COACH"]);

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
                eventId: data.eventId || null,
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
    await requireRole(["ADMIN", "COACH"]);

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

export async function updateCompetitionResult(id: string, result: string) {
    await requireRole(["ADMIN", "COACH"]);

    if (!id || !result) return { success: false, error: "Datos incompletos" };

    try {
        await prisma.competition.update({
            where: { id },
            data: { result },
        });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error updating result:", error);
        return { success: false, error: "Error al actualizar resultado" };
    }
}

export async function deleteCompetition(id: string) {
    await requireRole(["ADMIN"]); // Only Admin?

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
    await requireRole(["ADMIN", "COACH"]);

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

export type EventFormData = {
    name: string;
    date: string;
    location?: string;
    type?: string;
    weighInDate?: string;
};

export async function createEvent(data: EventFormData) {
    await requireRole(["ADMIN", "COACH"]);

    if (!data.name || !data.date) {
        return { success: false, error: "Nombre y fecha requeridos" };
    }

    try {
        await prisma.competitionEvent.create({
            data: {
                name: data.name,
                date: new Date(data.date),
                location: data.location,
                type: data.type,
                weighInDate: data.weighInDate ? new Date(data.weighInDate) : null,
            },
        });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: "Error al crear el evento" };
    }
}


export async function updateEvent(id: string, data: EventFormData) {
    await requireRole(["ADMIN", "COACH"]);

    const validation = validateData(eventSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        await prisma.competitionEvent.update({
            where: { id },
            data: {
                name: data.name,
                date: new Date(data.date),
                location: data.location || null,
                type: data.type || null,
                weighInDate: data.weighInDate ? new Date(data.weighInDate) : null,
            },
        });
        revalidatePath("/competencias");
        revalidatePath(`/competencias/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, error: "Error al actualizar evento" };
    }
}

export async function deleteEvent(id: string) {
    await requireRole(["ADMIN"]);

    try {
        await prisma.competitionEvent.delete({ where: { id } });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: "Error al eliminar el evento" };
    }
}
athleteId: string;
eventName: string;
date: string;
result ?: string;
category ?: string;
weight ?: number;
notes ?: string;
eventId ?: string;
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
                eventId: data.eventId || null,
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

export async function updateCompetitionResult(id: string, result: string) {
    if (!id || !result) return { success: false, error: "Datos incompletos" };

    try {
        await prisma.competition.update({
            where: { id },
            data: { result },
        });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error updating result:", error);
        return { success: false, error: "Error al actualizar resultado" };
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

export type EventFormData = {
    name: string;
    date: string;
    location?: string;
    type?: string;
    weighInDate?: string;
};

export async function createEvent(data: EventFormData) {
    if (!data.name || !data.date) {
        return { success: false, error: "Nombre y fecha requeridos" };
    }

    try {
        await prisma.competitionEvent.create({
            data: {
                name: data.name,
                date: new Date(data.date),
                location: data.location,
                type: data.type,
                weighInDate: data.weighInDate ? new Date(data.weighInDate) : null,
            },
        });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: "Error al crear el evento" };
    }
}


export async function updateEvent(id: string, data: EventFormData) {
    const validation = validateData(eventSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }

    try {
        await prisma.competitionEvent.update({
            where: { id },
            data: {
                name: data.name,
                date: new Date(data.date),
                location: data.location || null,
                type: data.type || null,
                weighInDate: data.weighInDate ? new Date(data.weighInDate) : null,
            },
        });
        revalidatePath("/competencias");
        revalidatePath(`/competencias/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, error: "Error al actualizar evento" };
    }
}

export async function deleteEvent(id: string) {
    try {
        await prisma.competitionEvent.delete({ where: { id } });
        revalidatePath("/competencias");
        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: "Error al eliminar el evento" };
    }
}
