import prisma from "@/lib/prisma";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN_FAILURE";
export type AuditEntity = "USER" | "COACH" | "ATHLETE" | "CLASS" | "MEMBERSHIP" | "SUBSCRIPTION" | "PAYMENT" | "SYSTEM";

export async function logAction(
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    performedBy: string,
    details?: any
) {
    try {
        // Enforce asynchronous logging to not split/block main thread
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                performedBy,
                details: details ? JSON.stringify(details) : undefined,
            },
        });
    } catch (error) {
        // Silently fail logging to not disrupt user flow, but log to console
        console.error("Failed to write Audit Log:", error);
    }
}
