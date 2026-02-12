"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/safe-action";
import { z } from "zod";

const evaluationSchema = z.object({
    athleteId: z.string(),
    date: z.date(),
    weight: z.number().optional().nullable(),
    height: z.number().optional().nullable(),
    bodyFat: z.number().optional().nullable(),
    technicalNotes: z.string().optional().nullable(),
    coachNotes: z.string().optional().nullable(),
});

export type EvaluationFormData = z.infer<typeof evaluationSchema>;

export async function createEvaluation(data: EvaluationFormData) {
    await requireRole(["ADMIN", "COACH"]);

    try {
        const evaluation = await prisma.evaluation.create({
            data: {
                athleteId: data.athleteId,
                date: data.date,
                weight: data.weight || null,
                height: data.height || null,
                bodyFat: data.bodyFat || null,
                technicalNotes: data.technicalNotes || null,
                coachNotes: data.coachNotes || null,
            },
        });

        revalidatePath(`/atletas/${data.athleteId}`);
        return { success: true, data: evaluation };
    } catch (error) {
        console.error("Error creating evaluation:", error);
        return { success: false, error: "Error al crear la evaluación" };
    }
}

export async function deleteEvaluation(id: string, athleteId: string) {
    await requireRole(["ADMIN", "COACH"]);

    try {
        await prisma.evaluation.delete({
            where: { id },
        });

        revalidatePath(`/atletas/${athleteId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting evaluation:", error);
        return { success: false, error: "Error al eliminar la evaluación" };
    }
}
