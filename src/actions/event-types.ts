"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireRole } from "@/lib/safe-action";

// ==========================================================
// COMPETITION CATEGORIES
// ==========================================================

export type CategoryData = {
    name: string;
    gender?: string;
    minWeight?: number;
    maxWeight?: number;
    active: boolean;
};

export async function getCompetitionCategories() {
    await requireRole(["ADMIN", "COACH"]);
    try {
        const categories = await prisma.competitionCategory.findMany({
            orderBy: { name: "asc" },
        });
        return { success: true, data: categories };
    } catch (error) {
        return { success: false, error: "Error al obtener categorías" };
    }
}

export async function createCompetitionCategory(data: CategoryData) {
    await requireAdmin();
    try {
        await prisma.competitionCategory.create({ data });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al crear categoría" };
    }
}

export async function updateCompetitionCategory(id: string, data: Partial<CategoryData>) {
    await requireAdmin();
    try {
        await prisma.competitionCategory.update({
            where: { id },
            data
        });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al actualizar categoría" };
    }
}

export async function deleteCompetitionCategory(id: string) {
    await requireAdmin();
    try {
        await prisma.competitionCategory.delete({ where: { id } });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar categoría" };
    }
}

// ==========================================================
// EVENT TYPES
// ==========================================================

export async function getEventTypes() {
    await requireRole(["ADMIN", "COACH"]);
    try {
        const types = await prisma.eventType.findMany({
            orderBy: { label: "asc" },
        });
        return { success: true, data: types };
    } catch (error) {
        return { success: false, error: "Error al obtener tipos de evento" };
    }
}

export async function createEventType(label: string) {
    await requireAdmin();
    try {
        await prisma.eventType.create({
            data: { label, active: true }
        });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al crear tipo de evento" };
    }
}

export async function deleteEventType(id: string) {
    await requireAdmin();
    try {
        await prisma.eventType.delete({ where: { id } });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar tipo de evento" };
    }
}

// ==========================================================

export type CategoryData = {
    name: string;
    gender?: string;
    minWeight?: number;
    maxWeight?: number;
    active: boolean;
};

export async function getCompetitionCategories() {
    try {
        const categories = await prisma.competitionCategory.findMany({
            orderBy: { name: "asc" },
        });
        return { success: true, data: categories };
    } catch (error) {
        return { success: false, error: "Error al obtener categorías" };
    }
}

export async function createCompetitionCategory(data: CategoryData) {
    try {
        await prisma.competitionCategory.create({ data });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al crear categoría" };
    }
}

export async function updateCompetitionCategory(id: string, data: Partial<CategoryData>) {
    try {
        await prisma.competitionCategory.update({
            where: { id },
            data
        });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al actualizar categoría" };
    }
}

export async function deleteCompetitionCategory(id: string) {
    try {
        await prisma.competitionCategory.delete({ where: { id } });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar categoría" };
    }
}

// ==========================================================
// EVENT TYPES
// ==========================================================

export async function getEventTypes() {
    try {
        const types = await prisma.eventType.findMany({
            orderBy: { label: "asc" },
        });
        return { success: true, data: types };
    } catch (error) {
        return { success: false, error: "Error al obtener tipos de evento" };
    }
}

export async function createEventType(label: string) {
    try {
        await prisma.eventType.create({
            data: { label, active: true }
        });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al crear tipo de evento" };
    }
}

export async function deleteEventType(id: string) {
    try {
        await prisma.eventType.delete({ where: { id } });
        revalidatePath("/configuracion/competencias");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar tipo de evento" };
    }
}
