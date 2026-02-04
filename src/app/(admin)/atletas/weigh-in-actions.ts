"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createWeighIn(
    athleteId: string,
    weight: number,
    date: Date,
    notes?: string
) {
    try {
        const weighIn = await prisma.weighIn.create({
            data: {
                athleteId,
                weight,
                date,
                notes,
            },
        });
        revalidatePath(`/atletas/${athleteId}`);
        return { success: true, data: weighIn };
    } catch (error) {
        console.error("Error creating weigh-in:", error);
        return { success: false, error: "Error al registrar el peso" };
    }
}

export async function deleteWeighIn(id: string, athleteId: string) {
    try {
        await prisma.weighIn.delete({
            where: { id },
        });
        revalidatePath(`/atletas/${athleteId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting weigh-in:", error);
        return { success: false, error: "Error al eliminar el registro" };
    }
}
