"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireRole } from "@/lib/safe-action";

export type ClassTypeData = {
    code: string;
    label: string;
    color: string;
    borderColor: string;
    icon?: string;
    active: boolean;
};

// --- READ ---

export async function getClassTypes() {
    await requireRole(["ADMIN", "COACH"]); // Coaches need to see types to create classes
    try {
        const types = await prisma.classType.findMany({
            orderBy: { label: "asc" },
        });
        return { success: true, data: types };
    } catch (error) {
        console.error("Error fetching class types:", error);
        return { success: false, error: "Error al obtener tipos de clase" };
    }
}

// --- CREATE ---

export async function createClassType(data: ClassTypeData) {
    await requireAdmin();

    try {
        // Ensure unique code
        const existing = await prisma.classType.findUnique({
            where: { code: data.code }
        });

        if (existing) {
            return { success: false, error: "Ya existe un tipo de clase con este código." };
        }

        const newType = await prisma.classType.create({
            data: {
                ...data,
                icon: data.icon || "Dumbbell" // Default icon
            }
        });

        revalidatePath("/configuracion/clases");
        return { success: true, data: newType };
    } catch (error) {
        console.error("Error creating class type:", error);
        return { success: false, error: "Error al crear tipo de clase" };
    }
}

// --- UPDATE ---

export async function updateClassType(id: string, data: Partial<ClassTypeData>) {
    await requireAdmin();

    try {
        const updatedType = await prisma.classType.update({
            where: { id },
            data
        });

        revalidatePath("/configuracion/clases");
        return { success: true, data: updatedType };
    } catch (error) {
        console.error("Error updating class type:", error);
        return { success: false, error: "Error al actualizar tipo de clase" };
    }
}

// --- DELETE ---

export async function deleteClassType(id: string) {
    await requireAdmin();

    try {
        // Check if involved in usage?
        // For risk mitigation, maybe just set inactive instead of hard delete?
        // But user asked for control.
        // Let's allow delete but warn in UI. 
        // Logic: if deleted, existing classes will keep the 'code' string, but wont find metadata in DB,
        // so they will fallback to Constants if code matches constant, or be broken?
        // The Plan says: Hybrid logic fallback.
        // If user deletes "Yoga" (custom), classes with "YOGA" code will lose Color/Label metadata 
        // unless we handle that.
        // Better: Soft delete (set active: false) is safer.
        // However, user strictly asked for RBAC here, I will stick to security.

        await prisma.classType.delete({
            where: { id }
        });

        revalidatePath("/configuracion/clases");
        return { success: true };
    } catch (error) {
        console.error("Error deleting class type:", error);
        return { success: false, error: "Error al eliminar tipo de clase" };
    }
}

// End of file
