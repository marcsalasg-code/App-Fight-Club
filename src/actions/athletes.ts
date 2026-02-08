"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/safe-action";


export type AthleteFormData = {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    pin?: string;
    dateOfBirth?: string;
    emergencyContact?: string;
    medicalConditions?: string;
    height?: number;
    weight?: number;
    level: string;
    goal: string;
    isCompetitor: boolean;
    competitionCategory?: string;
    tagIds?: string[]; // New field
};

export async function createAthlete(data: AthleteFormData) {
    await requireRole(["ADMIN", "COACH"]);

    try {
        // Check for duplicate PIN
        if (data.pin) {
            const existingPin = await prisma.athlete.findUnique({ where: { pin: data.pin } });
            if (existingPin) {
                return { success: false, error: "Este PIN ya está en uso" };
            }
        }

        const athlete = await prisma.athlete.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email || null,
                phone: data.phone || null,
                pin: data.pin || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                emergencyContact: data.emergencyContact || null,
                medicalConditions: data.medicalConditions || null,
                height: data.height || null,
                weight: data.weight || null,
                level: data.level,
                goal: data.goal,
                isCompetitor: data.isCompetitor,
                competitionCategory: data.competitionCategory || null,
                tags: {
                    connect: data.tagIds?.map(id => ({ id })) || []
                }
            },
        });
        revalidatePath("/atletas");
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error creating athlete:", error);
        return { success: false, error: "Error al crear el atleta" };
    }
}

export async function updateAthlete(id: string, data: AthleteFormData) {
    await requireRole(["ADMIN", "COACH"]);

    try {
        // Check for duplicate PIN (excluding current athlete)
        if (data.pin) {
            const existingPin = await prisma.athlete.findFirst({
                where: { pin: data.pin, id: { not: id } }
            });
            if (existingPin) {
                return { success: false, error: "Este PIN ya está en uso" };
            }
        }

        const athlete = await prisma.athlete.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email || null,
                phone: data.phone || null,
                pin: data.pin || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                emergencyContact: data.emergencyContact || null,
                medicalConditions: data.medicalConditions || null,
                height: data.height || null,
                weight: data.weight || null,
                level: data.level,
                goal: data.goal,
                isCompetitor: data.isCompetitor,
                competitionCategory: data.competitionCategory || null,
                tags: {
                    set: data.tagIds?.map(id => ({ id })) || []
                }
            },
        });
        revalidatePath("/atletas");
        revalidatePath(`/atletas/${id}`);
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error updating athlete:", error);
        return { success: false, error: "Error al actualizar el atleta" };
    }
}

export async function deleteAthlete(id: string) {
    await requireRole(["ADMIN"]); // Only Admin can delete? Or Coach too? Let's say Admin for safety.

    if (!id || typeof id !== "string") {
        return { success: false, error: "ID inválido" };
    }

    try {
        await prisma.athlete.delete({ where: { id } });
        revalidatePath("/atletas");
        return { success: true };
    } catch (error) {
        console.error("Error deleting athlete:", error);
        return { success: false, error: "Error al eliminar el atleta" };
    }
}

export async function toggleAthleteStatus(id: string, status: string) {
    await requireRole(["ADMIN", "COACH"]);

    if (!id || !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
        return { success: false, error: "Parámetros inválidos" };
    }

    try {
        const athlete = await prisma.athlete.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/atletas");
        revalidatePath(`/atletas/${id}`);
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error toggling athlete status:", error);
        return { success: false, error: "Error al cambiar el estado" };
    }
}

export async function deleteAthletes(ids: string[]) {
    await requireRole(["ADMIN"]);

    try {
        await prisma.athlete.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        revalidatePath("/atletas");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar los atletas" };
    }
}

export async function searchAthletes(query: string = "") {
    // Read actions usually public or protected? 
    // Protected for privacy.
    await requireRole(["ADMIN", "COACH"]);

    try {
        // Build where clause - show ALL athletes (no status filter)
        const whereClause = query && query.length >= 2
            ? {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" as const } },
                    { lastName: { contains: query, mode: "insensitive" as const } },
                    { email: { contains: query, mode: "insensitive" as const } },
                    { phone: { contains: query, mode: "insensitive" as const } },
                    { pin: { contains: query } },
                ],
            }
            : {}; // No filter, return recent athletes

        // Calculate current week boundaries (Monday-Sunday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const athletes = await prisma.athlete.findMany({
            where: whereClause,
            take: 80,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
                phone: true,
                pin: true,
                tags: { select: { label: true, color: true } },
                subscriptions: {
                    where: { status: "ACTIVE" },
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: { membership: true }
                },
                attendances: {
                    where: {
                        date: { gte: weekStart, lte: weekEnd }
                    }
                }
            },
        });

        return athletes.map(a => {
            const subscription = a.subscriptions[0];
            const sessionsUsed = a.attendances.length;
            const sessionsLimit = subscription?.membership.weeklyLimit || null;

            // Calculate membership color based on endDate
            let membershipColor: "green" | "yellow" | "red" = "red";
            let membershipLabel = "Sin membresía";
            let membershipName: string | null = null;

            if (subscription) {
                membershipName = subscription.membership.name;
                const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

                if (endDate) {
                    const daysSinceExpiry = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysSinceExpiry < 0) {
                        // Not expired yet
                        membershipColor = "green";
                        membershipLabel = "Activo";
                    } else if (daysSinceExpiry <= 5) {
                        // Grace period (0-5 days expired)
                        membershipColor = "yellow";
                        membershipLabel = "Prórroga";
                    } else {
                        // Expired > 5 days
                        membershipColor = "red";
                        membershipLabel = "Vencido";
                    }
                } else {
                    // No end date means unlimited/active
                    membershipColor = "green";
                    membershipLabel = "Activo";
                }
            }

            return {
                id: a.id,
                firstName: a.firstName,
                lastName: a.lastName,
                email: a.email,
                status: a.status,
                phone: a.phone,
                fullName: `${a.firstName} ${a.lastName}`,
                initials: `${a.firstName[0]}${a.lastName[0]}`.toUpperCase(),
                maskedPin: a.pin ? `***${a.pin.slice(-3)}` : undefined,
                // Membership indicators
                membershipColor,
                membershipLabel,
                membershipName,
                // Session indicators
                sessionsUsed,
                sessionsLimit,
                sessionsBadge: sessionsLimit ? `${sessionsUsed}/${sessionsLimit}` : null
            };
        });
    } catch (error) {
        console.error("Error searching athletes:", error);
        return [];
    }
}

/**
 * Get subscription status with weekly usage for an athlete
 */
export async function getAthleteSubscriptionStatus(athleteId: string) {
    await requireRole(["ADMIN", "COACH"]);

    try {
        const subscription = await prisma.subscription.findFirst({
            where: { athleteId, status: "ACTIVE" },
            include: { membership: true },
        });

        if (!subscription) {
            return { hasSubscription: false };
        }

        // Calculate current week boundaries
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Count weekly attendances
        const weeklyAttendances = await prisma.attendance.count({
            where: {
                athleteId,
                date: { gte: weekStart, lte: weekEnd },
            },
        });

        return {
            hasSubscription: true,
            membershipName: subscription.membership.name,
            weeklyLimit: subscription.membership.weeklyLimit,
            weeklyUsed: weeklyAttendances,
            classLimit: subscription.membership.classCount,
            classesUsed: subscription.classesUsed,
            endDate: subscription.endDate,
            status: subscription.status,
        };
    } catch (error) {
        console.error("Error getting subscription status:", error);
        return { hasSubscription: false };
    }
}
firstName: string;
lastName: string;
email ?: string;
phone ?: string;
pin ?: string;
dateOfBirth ?: string;
emergencyContact ?: string;
medicalConditions ?: string;
height ?: number;
weight ?: number;
level: string;
goal: string;
isCompetitor: boolean;
competitionCategory ?: string;
tagIds ?: string[]; // New field
};

export async function createAthlete(data: AthleteFormData) {
    // Validate input (skip tag validation for now in zod schema or update it separately)
    // const validation = validateData(athleteSchema, data);
    // if (!validation.success) {
    //     return { success: false, error: validation.error };
    // }

    try {
        // Check for duplicate PIN
        if (data.pin) {
            const existingPin = await prisma.athlete.findUnique({ where: { pin: data.pin } });
            if (existingPin) {
                return { success: false, error: "Este PIN ya está en uso" };
            }
        }

        const athlete = await prisma.athlete.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email || null,
                phone: data.phone || null,
                pin: data.pin || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                emergencyContact: data.emergencyContact || null,
                medicalConditions: data.medicalConditions || null,
                height: data.height || null,
                weight: data.weight || null,
                level: data.level,
                goal: data.goal,
                isCompetitor: data.isCompetitor,
                competitionCategory: data.competitionCategory || null,
                tags: {
                    connect: data.tagIds?.map(id => ({ id })) || []
                }
            },
        });
        revalidatePath("/atletas");
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error creating athlete:", error);
        return { success: false, error: "Error al crear el atleta" };
    }
}

export async function updateAthlete(id: string, data: AthleteFormData) {
    // Validate input
    // const validation = validateData(athleteSchema, data);
    // if (!validation.success) {
    //     return { success: false, error: validation.error };
    // }

    try {
        // Check for duplicate PIN (excluding current athlete)
        if (data.pin) {
            const existingPin = await prisma.athlete.findFirst({
                where: { pin: data.pin, id: { not: id } }
            });
            if (existingPin) {
                return { success: false, error: "Este PIN ya está en uso" };
            }
        }

        const athlete = await prisma.athlete.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email || null,
                phone: data.phone || null,
                pin: data.pin || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                emergencyContact: data.emergencyContact || null,
                medicalConditions: data.medicalConditions || null,
                height: data.height || null,
                weight: data.weight || null,
                level: data.level,
                goal: data.goal,
                isCompetitor: data.isCompetitor,
                competitionCategory: data.competitionCategory || null,
                tags: {
                    set: data.tagIds?.map(id => ({ id })) || []
                }
            },
        });
        revalidatePath("/atletas");
        revalidatePath(`/atletas/${id}`);
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error updating athlete:", error);
        return { success: false, error: "Error al actualizar el atleta" };
    }
}

export async function deleteAthlete(id: string) {
    if (!id || typeof id !== "string") {
        return { success: false, error: "ID inválido" };
    }

    try {
        await prisma.athlete.delete({ where: { id } });
        revalidatePath("/atletas");
        return { success: true };
    } catch (error) {
        console.error("Error deleting athlete:", error);
        return { success: false, error: "Error al eliminar el atleta" };
    }
}

export async function toggleAthleteStatus(id: string, status: string) {
    if (!id || !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
        return { success: false, error: "Parámetros inválidos" };
    }

    try {
        const athlete = await prisma.athlete.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/atletas");
        revalidatePath(`/atletas/${id}`);
        return { success: true, data: athlete };
    } catch (error) {
        console.error("Error toggling athlete status:", error);
        return { success: false, error: "Error al cambiar el estado" };
    }
}

export async function deleteAthletes(ids: string[]) {
    try {
        await prisma.athlete.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        revalidatePath("/atletas");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar los atletas" };
    }
}

export async function searchAthletes(query: string = "") {
    try {
        // Build where clause - show ALL athletes (no status filter)
        const whereClause = query && query.length >= 2
            ? {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" as const } },
                    { lastName: { contains: query, mode: "insensitive" as const } },
                    { email: { contains: query, mode: "insensitive" as const } },
                    { phone: { contains: query, mode: "insensitive" as const } },
                    { pin: { contains: query } },
                ],
            }
            : {}; // No filter, return recent athletes

        // Calculate current week boundaries (Monday-Sunday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const athletes = await prisma.athlete.findMany({
            where: whereClause,
            take: 80,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
                phone: true,
                pin: true,
                tags: { select: { label: true, color: true } },
                subscriptions: {
                    where: { status: "ACTIVE" },
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: { membership: true }
                },
                attendances: {
                    where: {
                        date: { gte: weekStart, lte: weekEnd }
                    }
                }
            },
        });

        return athletes.map(a => {
            const subscription = a.subscriptions[0];
            const sessionsUsed = a.attendances.length;
            const sessionsLimit = subscription?.membership.weeklyLimit || null;

            // Calculate membership color based on endDate
            let membershipColor: "green" | "yellow" | "red" = "red";
            let membershipLabel = "Sin membresía";
            let membershipName: string | null = null;

            if (subscription) {
                membershipName = subscription.membership.name;
                const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

                if (endDate) {
                    const daysSinceExpiry = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysSinceExpiry < 0) {
                        // Not expired yet
                        membershipColor = "green";
                        membershipLabel = "Activo";
                    } else if (daysSinceExpiry <= 5) {
                        // Grace period (0-5 days expired)
                        membershipColor = "yellow";
                        membershipLabel = "Prórroga";
                    } else {
                        // Expired > 5 days
                        membershipColor = "red";
                        membershipLabel = "Vencido";
                    }
                } else {
                    // No end date means unlimited/active
                    membershipColor = "green";
                    membershipLabel = "Activo";
                }
            }

            return {
                id: a.id,
                firstName: a.firstName,
                lastName: a.lastName,
                email: a.email,
                status: a.status,
                phone: a.phone,
                fullName: `${a.firstName} ${a.lastName}`,
                initials: `${a.firstName[0]}${a.lastName[0]}`.toUpperCase(),
                maskedPin: a.pin ? `***${a.pin.slice(-3)}` : undefined,
                // Membership indicators
                membershipColor,
                membershipLabel,
                membershipName,
                // Session indicators
                sessionsUsed,
                sessionsLimit,
                sessionsBadge: sessionsLimit ? `${sessionsUsed}/${sessionsLimit}` : null
            };
        });
    } catch (error) {
        console.error("Error searching athletes:", error);
        return [];
    }
}

/**
 * Get subscription status with weekly usage for an athlete
 */
export async function getAthleteSubscriptionStatus(athleteId: string) {
    try {
        const subscription = await prisma.subscription.findFirst({
            where: { athleteId, status: "ACTIVE" },
            include: { membership: true },
        });

        if (!subscription) {
            return { hasSubscription: false };
        }

        // Calculate current week boundaries
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Count weekly attendances
        const weeklyAttendances = await prisma.attendance.count({
            where: {
                athleteId,
                date: { gte: weekStart, lte: weekEnd },
            },
        });

        return {
            hasSubscription: true,
            membershipName: subscription.membership.name,
            weeklyLimit: subscription.membership.weeklyLimit,
            weeklyUsed: weeklyAttendances,
            classLimit: subscription.membership.classCount,
            classesUsed: subscription.classesUsed,
            endDate: subscription.endDate,
            status: subscription.status,
        };
    } catch (error) {
        console.error("Error getting subscription status:", error);
        return { hasSubscription: false };
    }
}
