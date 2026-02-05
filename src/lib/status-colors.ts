export type StatusColor = "red" | "amber" | "green" | "blue" | "default";

export const STATUS_COLORS = {
    // Traffic Light System
    CRITICAL: "bg-red-500/10 text-red-700 border-red-200", // Stop / Error
    WARNING: "bg-amber-500/10 text-amber-700 border-amber-200", // Caution / Action Needed
    SUCCESS: "bg-green-500/10 text-green-700 border-green-200", // Good / Active
    INFO: "bg-blue-500/10 text-blue-700 border-blue-200", // Info / Neutral
    DEFAULT: "bg-gray-500/10 text-gray-500 border-gray-200", // Inactive
};

export const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    TRIAL: "Prueba",
    EXPIRED: "Vencido",
    PENDING: "Pendiente",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
    SUSPENDED: "Suspendido",
};

export function getStatusColor(status: string): string {
    const s = status.toUpperCase();

    // Logic for mapping status strings to unified colors
    if (["EXPIRED", "CANCELLED", "SUSPENDED", "FAILED", "BLOCKED"].includes(s)) {
        return STATUS_COLORS.CRITICAL;
    }
    if (["PENDING", "PARTIAL", "ABSENT", "WARNING"].includes(s)) {
        return STATUS_COLORS.WARNING;
    }
    if (["ACTIVE", "COMPLETED", "PAID", "PRESENT", "WON"].includes(s)) {
        return STATUS_COLORS.SUCCESS;
    }
    if (["TRIAL", "UPCOMING", "SCHEDULED"].includes(s)) {
        return STATUS_COLORS.INFO;
    }

    return STATUS_COLORS.DEFAULT;
}
