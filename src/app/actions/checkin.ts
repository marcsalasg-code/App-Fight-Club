'use server';

import prisma from '@/lib/prisma';
import { signQrToken, verifyQrToken } from '@/lib/jwt';
import { revalidatePath } from 'next/cache';
import { toZonedTime } from 'date-fns-tz';
import { checkInPinSchema, validateData } from '@/lib/schemas';

// Configuration
const GYM_TIMEZONE = 'Europe/Madrid';
const CHECKIN_EARLY_MINUTES = 15;
const CHECKIN_LATE_MINUTES = 40;

// Day of week mapping
const DAY_MAP: Record<number, string> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
};

// Helper: Get 'Now' in App Configured Timezone
async function getGymNow() {
    const settings = await prisma.gymSettings.findFirst();
    const timezone = settings?.timezone || GYM_TIMEZONE;
    return toZonedTime(new Date(), timezone);
}

export async function generateClassQrPayload(classId: string) {
    if (!classId) throw new Error("Class ID required");

    const currentClass = await prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, name: true, startTime: true, dayOfWeek: true }
    });

    if (!currentClass) throw new Error("Class not found");

    const payload = {
        classId: currentClass.id,
        className: currentClass.name,
        timestamp: Date.now(),
    };

    return signQrToken(payload);
}

async function validateCheckInWindow(classId: string) {
    const currentClass = await prisma.class.findUnique({
        where: { id: classId },
    });

    if (!currentClass) return { valid: false, message: 'Clase no encontrada' };

    // Get settings
    const settings = await prisma.gymSettings.findFirst();
    const earlyMin = settings?.checkInEarlyMinutes ?? CHECKIN_EARLY_MINUTES;
    const lateMin = settings?.checkInLateMinutes ?? CHECKIN_LATE_MINUTES;

    // Get current time in Gym Timezone
    const now = await getGymNow();

    // ========== NEW: VALIDATE DAY OF WEEK ==========
    const todayDayName = DAY_MAP[now.getDay()];
    if (currentClass.dayOfWeek !== todayDayName) {
        return {
            valid: false,
            message: `Esta clase es de ${currentClass.dayOfWeek.toLowerCase()}, hoy es ${todayDayName.toLowerCase()}`
        };
    }
    // ================================================

    // Parse Class Start Time (String "HH:mm") relative to "Today" in Gym Timezone
    const [hours, minutes] = currentClass.startTime.split(':').map(Number);
    const classStartTime = new Date(now);
    classStartTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = (now.getTime() - classStartTime.getTime()) / (1000 * 60);

    console.log(`[CheckIn] Class: ${currentClass.name} @ ${currentClass.startTime}`);
    console.log(`[CheckIn] Day Check: Class=${currentClass.dayOfWeek}, Today=${todayDayName}`);
    console.log(`[CheckIn] Time Diff: ${diffMinutes.toFixed(2)} mins (early=${earlyMin}, late=${lateMin})`);

    if (diffMinutes < -earlyMin) {
        return { valid: false, message: `Demasiado pronto. El check-in abre ${earlyMin} min antes.` };
    }

    if (diffMinutes > lateMin) {
        return { valid: false, message: 'El tiempo de check-in ha expirado.' };
    }

    return { valid: true, classData: currentClass };
}

export async function performCheckInWithPin(pin: string, token: string) {
    // Validate input
    const validation = validateData(checkInPinSchema, { pin, token });
    if (!validation.success) {
        return { success: false, message: validation.error };
    }

    // 1. Verify Token
    const payload = verifyQrToken(token);
    if (!payload || typeof payload === 'string') return { success: false, message: "Código QR inválido o expirado" };
    const { classId } = payload;

    // 2. Validate Time Window AND Day of Week
    const timeValidation = await validateCheckInWindow(classId);
    if (!timeValidation.valid) {
        return { success: false, message: timeValidation.message };
    }

    // 3. Find Athlete by PIN
    const athlete = await prisma.athlete.findUnique({ where: { pin } });

    if (!athlete) {
        return { success: false, message: "PIN incorrecto o no encontrado." };
    }

    // Check athlete status
    if (athlete.status !== "ACTIVE") {
        return { success: false, message: "Tu cuenta no está activa. Contacta al staff." };
    }

    // 4. Record Attendance
    try {
        const todayStart = await getGymNow();
        todayStart.setHours(0, 0, 0, 0);

        const alreadyCheckedIn = await prisma.attendance.findFirst({
            where: {
                athleteId: athlete.id,
                classId: classId,
                date: {
                    gte: todayStart
                }
            }
        });

        if (alreadyCheckedIn) {
            return { success: true, message: `Bienvenido de nuevo, ${athlete.firstName}`, athleteName: athlete.firstName };
        }

        await prisma.attendance.create({
            data: {
                athleteId: athlete.id,
                classId: classId,
                date: new Date(),
                checkInTime: new Date(),
                method: 'PIN'
            }
        });

    } catch (error) {
        console.error("Check-in error:", error);
        return { success: false, message: "Error al registrar asistencia. Intenta de nuevo." };
    }

    revalidatePath('/calendario');
    return { success: true, message: `¡Bienvenido/a, ${athlete.firstName}!`, athleteName: athlete.firstName };
}
