"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/safe-action";

export type GymSettingsData = {
    gymName: string;
    timezone: string;
    checkInEarlyMinutes: number;
    checkInLateMinutes: number;
    bookingMaxDaysInAdvance: number;
    lateCancellationHours: number;
    consecutiveNoShowsLimit: number;
    walletPassBackgroundColor: string;
    walletInstagram?: string | null;
    walletAddress?: string | null;
    walletPhone?: string | null;
};

export async function getGymSettings() {
    try {
        const settings = await prisma.gymSettings.findFirst();
        if (!settings) {
            return {
                gymName: "RC Fight Club",
                timezone: "Europe/Madrid",
                checkInEarlyMinutes: 15,
                checkInLateMinutes: 40,
                bookingMaxDaysInAdvance: 7,
                lateCancellationHours: 2,
                consecutiveNoShowsLimit: 3,
                walletPassBackgroundColor: "#000000",
                walletInstagram: "",
                walletAddress: "",
                walletPhone: "",
            };
        }
        return {
            id: settings.id,
            gymName: settings.gymName,
            timezone: settings.timezone,
            checkInEarlyMinutes: settings.checkInEarlyMinutes,
            checkInLateMinutes: settings.checkInLateMinutes,
            bookingMaxDaysInAdvance: settings.bookingMaxDaysInAdvance ?? 7,
            lateCancellationHours: settings.lateCancellationHours ?? 2,
            consecutiveNoShowsLimit: settings.consecutiveNoShowsLimit ?? 3,
            walletPassBackgroundColor: settings.walletPassBackgroundColor ?? "#000000",
            walletInstagram: settings.walletInstagram ?? "",
            walletAddress: settings.walletAddress ?? "",
            walletPhone: settings.walletPhone ?? "",
        };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
}

export async function updateGymSettings(data: GymSettingsData) {
    await requireAdmin();

    try {
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
