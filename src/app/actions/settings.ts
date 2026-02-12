"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/safe-action";

export type GymSettingsData = {
    gymName: string;
    timezone: string;
    checkInEarlyMinutes: number;
    checkInLateMinutes: number;
};

export async function getGymSettings() {
    try {
        const settings = await prisma.gymSettings.findFirst();
        if (!settings) {
            // Return defaults if not set (or create one)
            return {
                gymName: "RC Fight Club",
                timezone: "Europe/Madrid",
                checkInEarlyMinutes: 15,
                checkInLateMinutes: 40,
            };
        }
        return settings;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
}

export async function updateGymSettings(data: GymSettingsData) {
    await requireAdmin();

    try {
        // Upsert ensures we have only one settings record
        const first = await prisma.gymSettings.findFirst();

        if (first) {
            await prisma.gymSettings.update({
                where: { id: first.id },
                data,
            });
        } else {
            await prisma.gymSettings.create({
                data,
            });
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating settings:", error);
        return { success: false, error: "Error al guardar la configuración" };
    }
}
