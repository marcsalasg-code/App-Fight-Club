"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireRole } from "@/lib/safe-action";

export async function getTags() {
    await requireRole(["ADMIN", "COACH"]);
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { label: "asc" },
            include: {
                _count: {
                    select: { athletes: true }
                }
            }
        });
        return { success: true, data: tags };
    } catch (error) {
        console.error("Error getting tags:", error);
        return { success: false, error: "Error al obtener etiquetas" };
    }
}

export async function createTag(label: string, color: string) {
    await requireAdmin(); // Tags are configuration

    if (!label) return { success: false, error: "Nombre requerido" };

    try {
        const tag = await prisma.tag.create({
            data: {
                label,
                color: color || "#EF4444"
            }
        });
        revalidatePath("/configuracion/etiquetas");
        return { success: true, data: tag };
    } catch (error) {
        console.error("Error creating tag:", error);
        return { success: false, error: "Error al crear etiqueta" };
    }
}

export async function deleteTag(id: string) {
    await requireAdmin();

    try {
        await prisma.tag.delete({ where: { id } });
        revalidatePath("/configuracion/etiquetas");
        return { success: true };
    } catch (error) {
        console.error("Error deleting tag:", error);
        return { success: false, error: "Error al eliminar etiqueta" };
    }
}

try {
    const tags = await prisma.tag.findMany({
        orderBy: { label: "asc" },
        include: {
            _count: {
                select: { athletes: true }
            }
        }
    });
    return { success: true, data: tags };
} catch (error) {
    console.error("Error getting tags:", error);
    return { success: false, error: "Error al obtener etiquetas" };
}
}

export async function createTag(label: string, color: string) {
    if (!label) return { success: false, error: "Nombre requerido" };

    try {
        const tag = await prisma.tag.create({
            data: {
                label,
                color: color || "#EF4444"
            }
        });
        revalidatePath("/configuracion/etiquetas");
        return { success: true, data: tag };
    } catch (error) {
        console.error("Error creating tag:", error);
        return { success: false, error: "Error al crear etiqueta" };
    }
}

export async function deleteTag(id: string) {
    try {
        await prisma.tag.delete({ where: { id } });
        revalidatePath("/configuracion/etiquetas");
        return { success: true };
    } catch (error) {
        console.error("Error deleting tag:", error);
        return { success: false, error: "Error al eliminar etiqueta" };
    }
}
