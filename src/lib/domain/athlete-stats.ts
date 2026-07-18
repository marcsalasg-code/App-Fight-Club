/**
 * Domain-specific calculations and business logic for Athlete stats,
 * membership statuses, and scheduling boundaries.
 */

export interface DomainSubscription {
    id: string;
    status: string;
    endDate: Date | null;
    membership: {
        id: string;
        name: string;
        weeklyLimit: number | null;
        classCount: number | null;
    };
}

export interface WeekBoundaries {
    start: Date;
    end: Date;
}

/**
 * Calculates the current week boundaries (Monday 00:00:00.000 to Sunday 23:59:59.999)
 * dynamically based on a pivot date.
 */
export function getWeekBoundaries(pivot: Date = new Date()): WeekBoundaries {
    const start = new Date(pivot);
    start.setHours(0, 0, 0, 0);
    const dayOfWeek = start.getDay();
    // In JS, getDay() returns 0 for Sunday. We want Monday (1) as the start of week.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + mondayOffset);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

export type MembershipStatusColor = "green" | "yellow" | "red";

export interface MembershipStatus {
    color: MembershipStatusColor;
    label: string;
    name: string | null;
}

/**
 * Resolves membership details (status color, text label, and name) based on a subscription.
 */
export function resolveMembershipStatus(
    subscription: DomainSubscription | null,
    now: Date = new Date()
): MembershipStatus {
    if (!subscription) {
        return {
            color: "red",
            label: "Sin membresía",
            name: null,
        };
    }

    const name = subscription.membership.name;
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

    if (!endDate) {
        // No end date means unlimited/active
        return {
            color: "green",
            label: "Activo",
            name,
        };
    }

    // Calculate days since expiry
    const daysSinceExpiry = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceExpiry < 0) {
        return {
            color: "green",
            label: "Activo",
            name,
        };
    } else if (daysSinceExpiry <= 5) {
        return {
            color: "yellow",
            label: "Prórroga",
            name,
        };
    } else {
        return {
            color: "red",
            label: "Vencido",
            name,
        };
    }
}
