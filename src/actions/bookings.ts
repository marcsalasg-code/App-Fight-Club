"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfWeek, endOfWeek, addDays, getDay, isSameDay, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const GYM_TIMEZONE = "Europe/Madrid";

// Day mapping (to match Class dayOfWeek attribute MONDAY, etc.)
const DAY_MAP_REVERSE: Record<string, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 0,
};

async function getGymNow() {
    const settings = await prisma.gymSettings.findFirst();
    const timezone = settings?.timezone || GYM_TIMEZONE;
    return toZonedTime(new Date(), timezone);
}

export async function getAthleteByPin(pin: string) {
    if (!pin || pin.length < 4) {
        return { success: false, error: "El PIN debe tener al menos 4 caracteres" };
    }

    try {
        const athlete = await prisma.athlete.findUnique({
            where: { pin },
            include: {
                subscriptions: {
                    where: { status: "ACTIVE" },
                    include: { membership: true }
                }
            }
        });

        if (!athlete) {
            return { success: false, error: "PIN incorrecto o atleta no encontrado" };
        }

        if (athlete.status !== "ACTIVE") {
            return { success: false, error: "Tu cuenta de atleta no está activa. Contacta al staff." };
        }

        const activeSub = athlete.subscriptions[0];
        return {
            success: true,
            athlete: {
                id: athlete.id,
                firstName: athlete.firstName,
                lastName: athlete.lastName,
                pin: athlete.pin,
                subscription: activeSub ? {
                    id: activeSub.id,
                    membershipName: activeSub.membership.name,
                    weeklyLimit: activeSub.membership.weeklyLimit,
                } : null
            }
        };
    } catch (e) {
        console.error("Error in getAthleteByPin:", e);
        return { success: false, error: "Error en el servidor al buscar atleta." };
    }
}

export async function createBooking(athleteId: string, classId: string, dateStr: string) {
    try {
        const date = new Date(dateStr);

        // 1. Verificaciones del atleta
        const athlete = await prisma.athlete.findUnique({
            where: { id: athleteId },
            include: {
                subscriptions: {
                    where: { status: "ACTIVE" },
                    include: { membership: true }
                }
            }
        });

        if (!athlete || athlete.status !== "ACTIVE") {
            return { success: false, error: "Atleta no encontrado o inactivo" };
        }

        const activeSub = athlete.subscriptions[0];
        if (!activeSub) {
            return { success: false, error: "No tienes una membresía activa para reservar" };
        }

        // 2. Verificaciones de la clase
        const gymClass = await prisma.class.findUnique({
            where: { id: classId }
        });

        if (!gymClass || !gymClass.active) {
            return { success: false, error: "La clase no existe o ya no está disponible" };
        }

        // 2.1 Verificación de días de anticipación de reserva
        const settings = await prisma.gymSettings.findFirst();
        const maxDays = settings?.bookingMaxDaysInAdvance ?? 7;
        const nowZoned = await getGymNow();
        const maxAllowedDate = addDays(nowZoned, maxDays);
        maxAllowedDate.setHours(23, 59, 59, 999);

        if (date > maxAllowedDate) {
            return {
                success: false,
                error: `Solo se pueden hacer reservas con un máximo de ${maxDays} días de anticipación.`
            };
        }

        // 3. Duplicado
        const existing = await prisma.classBooking.findFirst({
            where: {
                athleteId,
                classId,
                date
            }
        });

        if (existing) {
            return { success: false, error: "Ya estás reservado para esta clase" };
        }

        // 4. Capacidad de la clase
        const currentBookingsCount = await prisma.classBooking.count({
            where: { classId, date }
        });

        if (currentBookingsCount >= gymClass.maxCapacity) {
            return { success: false, error: "La clase está completa" };
        }

        // 5. Límite semanal
        const weeklyLimit = activeSub.membership.weeklyLimit;
        if (weeklyLimit !== null && weeklyLimit !== undefined) {
            const startOfCurrentWeek = startOfWeek(date, { weekStartsOn: 1 });
            const endOfCurrentWeek = endOfWeek(date, { weekStartsOn: 1 });

            const weeklyBookingCount = await prisma.classBooking.count({
                where: {
                    athleteId,
                    date: {
                        gte: startOfCurrentWeek,
                        lte: endOfCurrentWeek
                    }
                }
            });

            if (weeklyBookingCount >= weeklyLimit) {
                return {
                    success: false,
                    error: `Has superado tu límite de membresía de ${weeklyLimit} clases semanales.`
                };
            }
        }

        // Crear reserva
        await prisma.classBooking.create({
            data: {
                athleteId,
                classId,
                date
            }
        });

        revalidatePath("/reservar");
        return { success: true };
    } catch (e) {
        console.error("Error creating booking:", e);
        return { success: false, error: "Error en el servidor al procesar la reserva." };
    }
}

export async function cancelBooking(athleteId: string, classId: string, dateStr: string) {
    try {
        const date = new Date(dateStr);

        const booking = await prisma.classBooking.findFirst({
            where: {
                athleteId,
                classId,
                date
            },
            include: {
                class: true
            }
        });

        if (!booking) {
            return { success: false, error: "Reserva no encontrada." };
        }

        // Verificación de cancelación tardía
        const settings = await prisma.gymSettings.findFirst();
        const lateCancellationHours = settings?.lateCancellationHours ?? 2;

        const classDate = new Date(booking.date);
        const [hours, minutes] = booking.class.startTime.split(":").map(Number);
        classDate.setHours(hours, minutes, 0, 0);

        const gymNow = await getGymNow();
        const diffInMs = classDate.getTime() - gymNow.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < lateCancellationHours) {
            return {
                success: false,
                error: `No puedes cancelar reservas con menos de ${lateCancellationHours} horas de antelación.`
            };
        }

        await prisma.classBooking.delete({
            where: { id: booking.id }
        });

        revalidatePath("/reservar");
        return { success: true };
    } catch (e) {
        console.error("Error cancelling booking:", e);
        return { success: false, error: "Error al cancelar la reserva." };
    }
}

export async function getClientReservations(athleteId: string) {
    try {
        const now = await getGymNow();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const bookings = await prisma.classBooking.findMany({
            where: {
                athleteId,
                date: { gte: startOfToday }
            },
            include: {
                class: true
            },
            orderBy: { date: "asc" }
        });

        return { success: true, bookings };
    } catch (e) {
        console.error("Error in getClientReservations:", e);
        return { success: false, error: "Error de servidor al cargar reservas" };
    }
}

export async function getScheduleForReservations(athleteId: string) {
    try {
        const gymNow = await getGymNow();
        const settings = await prisma.gymSettings.findFirst();
        const maxDays = settings?.bookingMaxDaysInAdvance ?? 7;

        // Rolling maxDays days from today
        const days = Array.from({ length: maxDays }, (_, i) => {
            const d = addDays(gymNow, i);
            d.setHours(0, 0, 0, 0);
            return d;
        });

        // Load all active classes
        const classes = await prisma.class.findMany({
            where: { active: true },
            include: {
                coaches: {
                    select: { id: true, name: true }
                }
            }
        });

        // Load coach substitutions for the booking window
        const substitutions = await prisma.classCoachSubstitution.findMany({
            where: {
                date: {
                    gte: startOfDay(days[0]),
                    lte: days[days.length - 1]
                }
            },
            include: {
                newCoach: { select: { id: true, name: true } }
            }
        });

        // Compile class occurrences
        const occurrences: any[] = [];

        for (const day of days) {
            const dayNum = getDay(day); // 0 = Sunday, 1 = Monday...

            // Find class template active on this day name
            const dayClasses = classes.filter(c => DAY_MAP_REVERSE[c.dayOfWeek] === dayNum);

            for (const cls of dayClasses) {
                // Count current bookings
                const currentBookingsCount = await prisma.classBooking.count({
                    where: {
                        classId: cls.id,
                        date: day
                    }
                });

                // Is athlete booked?
                const isBooked = await prisma.classBooking.findFirst({
                    where: {
                        athleteId,
                        classId: cls.id,
                        date: day
                    }
                });

                // Apply coach substitution if exists
                const sub = substitutions.find(s => s.classId === cls.id && isSameDay(s.date, day));
                const effectiveCoaches = sub ? [sub.newCoach] : cls.coaches;

                occurrences.push({
                    id: `${cls.id}_${day.toISOString().split("T")[0]}`,
                    classId: cls.id,
                    name: cls.name,
                    type: cls.type,
                    startTime: cls.startTime,
                    endTime: cls.endTime,
                    levelRequired: cls.levelRequired,
                    maxCapacity: cls.maxCapacity,
                    color: cls.color,
                    date: day.toISOString(),
                    bookingsCount: currentBookingsCount,
                    isBooked: !!isBooked,
                    coaches: effectiveCoaches,
                    isSubstitute: !!sub
                });
            }
        }

        // Sort by date then start time
        occurrences.sort((a, b) => {
            const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return a.startTime.localeCompare(b.startTime);
        });

        // Calculate limits indicator for athlete
        const startOfCurrentWeek = startOfWeek(gymNow, { weekStartsOn: 1 });
        const endOfCurrentWeek = endOfWeek(gymNow, { weekStartsOn: 1 });

        const weeklyBookingCount = await prisma.classBooking.count({
            where: {
                athleteId,
                date: {
                    gte: startOfCurrentWeek,
                    lte: endOfCurrentWeek
                }
            }
        });

        return {
            success: true,
            schedule: occurrences,
            weeklyUsed: weeklyBookingCount
        };
    } catch (e) {
        console.error("Error in getScheduleForReservations:", e);
        return { success: false, error: "Error de servidor al cargar horarios" };
    }
}
