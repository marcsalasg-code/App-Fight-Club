"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/safe-action";
import { getWeekBoundaries, resolveMembershipStatus } from "@/lib/domain/athlete-stats";
import { validateData, athleteSchema } from "@/lib/schemas";


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

    const validation = validateData(athleteSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }
    const validated = validation.data;

    try {
        // Check for duplicate PIN
        if (validated.pin) {
            const existingPin = await prisma.athlete.findUnique({ where: { pin: validated.pin } });
            if (existingPin) {
                return { success: false, error: "Este PIN ya está en uso" };
            }
        }

        const athlete = await prisma.athlete.create({
            data: {
                firstName: validated.firstName,
                lastName: validated.lastName,
                email: validated.email || null,
                phone: validated.phone || null,
                pin: validated.pin || null,
                dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
                emergencyContact: validated.emergencyContact || null,
                medicalConditions: validated.medicalConditions || null,
                height: validated.height || null,
                weight: validated.weight || null,
                level: validated.level,
                goal: validated.goal,
                isCompetitor: validated.isCompetitor,
                competitionCategory: validated.competitionCategory || null,
                tags: {
                    connect: validated.tagIds?.map(id => ({ id })) || []
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

    const validation = validateData(athleteSchema, data);
    if (!validation.success) {
        return { success: false, error: validation.error };
    }
    const validated = validation.data;

    try {
        // Check for duplicate PIN (excluding current athlete)
        if (validated.pin) {
            const existingPin = await prisma.athlete.findFirst({
                where: { pin: validated.pin, id: { not: id } }
            });
            if (existingPin) {
                return { success: false, error: "Este PIN ya está en uso" };
            }
        }

        const athlete = await prisma.athlete.update({
            where: { id },
            data: {
                firstName: validated.firstName,
                lastName: validated.lastName,
                email: validated.email || null,
                phone: validated.phone || null,
                pin: validated.pin || null,
                dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
                emergencyContact: validated.emergencyContact || null,
                medicalConditions: validated.medicalConditions || null,
                height: validated.height || null,
                weight: validated.weight || null,
                level: validated.level,
                goal: validated.goal,
                isCompetitor: validated.isCompetitor,
                competitionCategory: validated.competitionCategory || null,
                tags: {
                    set: validated.tagIds?.map(id => ({ id })) || []
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
    const session = await requireRole(["ADMIN", "COACH"]); // Coaches can now delete athletes

    if (!id || typeof id !== "string") {
        return { success: false, error: "ID inválido" };
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.athlete.delete({ where: { id } });
            await tx.auditLog.create({
                data: {
                    action: "DELETE",
                    entity: "Athlete",
                    entityId: id,
                    performedBy: session.user.id,
                    details: { timestamp: new Date() }
                }
            });
        });

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
    const session = await requireRole(["ADMIN", "COACH"]);

    try {
        await prisma.$transaction(async (tx) => {
            await tx.athlete.deleteMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
            });

            await tx.auditLog.createMany({
                data: ids.map(id => ({
                    action: "DELETE",
                    entity: "Athlete",
                    entityId: id,
                    performedBy: session.user.id,
                    details: { timestamp: new Date() }
                }))
            });
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

        // Calculate current week boundaries (Monday-Sunday) Using Domain rules
        const { start: weekStart, end: weekEnd } = getWeekBoundaries();

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

        const now = new Date();
        return athletes.map(a => {
            const subscription = a.subscriptions[0];
            const sessionsUsed = a.attendances.length;
            const sessionsLimit = subscription?.membership.weeklyLimit || null;

            // Resolve membership using Domain pure calculations
            const { color: membershipColor, label: membershipLabel, name: membershipName } = resolveMembershipStatus(subscription, now);

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

        // Calculate current week boundaries using Domain Rules
        const { start: weekStart, end: weekEnd } = getWeekBoundaries();

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
// End of file
