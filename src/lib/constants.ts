// Centralized constants for the gym manager application

// ==========================================================
// CLASS TYPES
// ==========================================================
export const CLASS_TYPES = [
    { value: "MUAY_THAI", label: "Muay Thai" },
    { value: "KICKBOXING", label: "Kickboxing" },
    { value: "SPARRING", label: "Sparring" },
    { value: "CONDITIONING", label: "Acondicionamiento" },
    { value: "COMPETITION", label: "Competición" },
] as const;

export const CLASS_TYPE_LABELS: Record<string, string> = {
    MUAY_THAI: "Muay Thai",
    KICKBOXING: "Kickboxing",
    SPARRING: "Sparring",
    CONDITIONING: "Acondicionamiento",
    COMPETITION: "Competición",
};

// ==========================================================
// DAYS OF WEEK
// ==========================================================
export const DAYS_OF_WEEK = [
    { value: "MONDAY", label: "Lunes" },
    { value: "TUESDAY", label: "Martes" },
    { value: "WEDNESDAY", label: "Miércoles" },
    { value: "THURSDAY", label: "Jueves" },
    { value: "FRIDAY", label: "Viernes" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" },
] as const;

export const DAY_LABELS: Record<string, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

// ==========================================================
// ATHLETE LEVELS
// ==========================================================
export const ATHLETE_LEVELS = [
    { value: "BEGINNER", label: "Principiante" },
    { value: "INTERMEDIATE", label: "Intermedio" },
    { value: "ADVANCED", label: "Avanzado" },
] as const;

export const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: "Principiante",
    INTERMEDIATE: "Intermedio",
    ADVANCED: "Avanzado",
};

// ==========================================================
// ATHLETE GOALS
// ==========================================================
export const ATHLETE_GOALS = [
    { value: "FITNESS", label: "Fitness" },
    { value: "WEIGHT_LOSS", label: "Pérdida de peso" },
    { value: "SELF_DEFENSE", label: "Defensa personal" },
    { value: "COMPETITION", label: "Competición" },
] as const;

export const GOAL_LABELS: Record<string, string> = {
    FITNESS: "Fitness",
    WEIGHT_LOSS: "Pérdida de peso",
    SELF_DEFENSE: "Defensa personal",
    COMPETITION: "Competición",
};

// ==========================================================
// COMPETITION RESULTS
// ==========================================================
export const COMPETITION_RESULTS = [
    { value: "WON", label: "Victoria" },
    { value: "LOST", label: "Derrota" },
    { value: "DRAW", label: "Empate" },
    { value: "PENDING", label: "Pendiente" },
] as const;

export const RESULT_COLORS: Record<string, string> = {
    WON: "bg-green-500/10 text-green-700",
    LOST: "bg-red-500/10 text-red-700",
    DRAW: "bg-yellow-500/10 text-yellow-700",
    PENDING: "bg-gray-500/10 text-gray-700",
};

// ==========================================================
// CLASS COLORS
// ==========================================================
export const CLASS_COLORS = [
    { value: "#D4AF37", label: "Dorado" },
    { value: "#E11D48", label: "Rojo" },
    { value: "#2563EB", label: "Azul" },
    { value: "#16A34A", label: "Verde" },
    { value: "#7C3AED", label: "Morado" },
] as const;

// ==========================================================
// PAYMENT METHODS
// ==========================================================
export const PAYMENT_METHODS = [
    { value: "CASH", label: "Efectivo" },
    { value: "CARD", label: "Tarjeta" },
    { value: "TRANSFER", label: "Transferencia" },
] as const;

// ==========================================================
// CHECK-IN METHODS
// ==========================================================
export const CHECKIN_METHODS = {
    MANUAL: "MANUAL",
    QR: "QR",
    PIN: "PIN",
} as const;
