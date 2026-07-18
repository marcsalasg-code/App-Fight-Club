import { describe, it, expect } from "vitest";
import { getWeekBoundaries, resolveMembershipStatus, DomainSubscription } from "./athlete-stats";

function toLocalYMD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

describe("athlete-stats domain calculations", () => {
    describe("getWeekBoundaries", () => {
        it("should calculate correct boundaries when pivot is a Wednesday", () => {
            const pivot = new Date(2026, 6, 15, 12, 0, 0); // 2026-07-15 Wednesday Local
            const { start, end } = getWeekBoundaries(pivot);

            // Monday of that week is 2026-07-13 Local
            expect(toLocalYMD(start)).toBe("2026-07-13");
            expect(start.getHours()).toBe(0);

            // Sunday of that week is 2026-07-19 Local
            expect(toLocalYMD(end)).toBe("2026-07-19");
        });

        it("should handle Sunday correctly as the end of the week, starting on Monday", () => {
            const pivot = new Date(2026, 6, 19, 18, 0, 0); // 2026-07-19 Sunday Local
            const { start, end } = getWeekBoundaries(pivot);

            expect(toLocalYMD(start)).toBe("2026-07-13");
            expect(toLocalYMD(end)).toBe("2026-07-19");
        });
    });

    describe("resolveMembershipStatus", () => {
        const mockSubscription: DomainSubscription = {
            id: "sub-1",
            status: "ACTIVE",
            endDate: null,
            membership: {
                id: "mem-1",
                name: "Unlimited Pass",
                weeklyLimit: null,
                classCount: null,
            },
        };

        it("should return red Sin membresía when subscription is null", () => {
            const result = resolveMembershipStatus(null);
            expect(result.color).toBe("red");
            expect(result.label).toBe("Sin membresía");
            expect(result.name).toBeNull();
        });

        it("should return green Activo when subscription has no endDate", () => {
            const result = resolveMembershipStatus(mockSubscription);
            expect(result.color).toBe("green");
            expect(result.label).toBe("Activo");
            expect(result.name).toBe("Unlimited Pass");
        });

        it("should return green Activo if end date is in the future", () => {
            const now = new Date("2026-07-15T00:00:00.000Z");
            const endDate = new Date("2026-07-20T00:00:00.000Z"); // future
            const sub = { ...mockSubscription, endDate };
            const result = resolveMembershipStatus(sub, now);
            expect(result.color).toBe("green");
            expect(result.label).toBe("Activo");
        });

        it("should return yellow Prórroga if expired but within 5 grace days", () => {
            const now = new Date("2026-07-18T00:00:00.000Z");
            const endDate = new Date("2026-07-15T00:00:00.000Z"); // expired 3 days ago
            const sub = { ...mockSubscription, endDate };
            const result = resolveMembershipStatus(sub, now);
            expect(result.color).toBe("yellow");
            expect(result.label).toBe("Prórroga");
        });

        it("should return red Vencido if expired more than 5 days", () => {
            const now = new Date("2026-07-25T00:00:00.000Z");
            const endDate = new Date("2026-07-15T00:00:00.000Z"); // expired 10 days ago
            const sub = { ...mockSubscription, endDate };
            const result = resolveMembershipStatus(sub, now);
            expect(result.color).toBe("red");
            expect(result.label).toBe("Vencido");
        });
    });
});
