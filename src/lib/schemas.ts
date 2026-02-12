import { z } from "zod";

// ==========================================================
// ATHLETE SCHEMAS
// ==========================================================
export const athleteSchema = z.object({
    firstName: z.string().min(1, "El nombre es requerido").max(100),
    lastName: z.string().min(1, "El apellido es requerido").max(100),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().max(20).optional().or(z.literal("")),
    pin: z.string().length(4, "El PIN debe tener 4 dígitos").regex(/^\d{4}$/, "PIN debe ser numérico").optional().or(z.literal("")),
    dateOfBirth: z.string().optional().or(z.literal("")),
    emergencyContact: z.string().max(100).optional().or(z.literal("")),
    medicalConditions: z.string().max(500).optional().or(z.literal("")),
    height: z.number().min(50).max(250).optional(),
    weight: z.number().min(20).max(300).optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    goal: z.enum(["FITNESS", "WEIGHT_LOSS", "SELF_DEFENSE", "COMPETITION", "RECREATIONAL"]),
    isCompetitor: z.boolean(),
    competitionCategory: z.string().max(50).optional().or(z.literal("")),
});

export type AthleteInput = z.infer<typeof athleteSchema>;

// ==========================================================
// CLASS SCHEMAS
// ==========================================================
export const classSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(100),
    type: z.string().min(1, "Tipo de clase requerido"),
    dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
    coachIds: z.array(z.string()).optional(),
    levelRequired: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
    maxCapacity: z.number().min(1).max(100).default(20),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido").optional(),
});

export type ClassInput = z.infer<typeof classSchema>;

// ==========================================================
// MEMBERSHIP SCHEMAS
// ==========================================================
export const membershipSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(100),
    price: z.number().min(0, "El precio debe ser positivo"),
    durationDays: z.number().min(1).max(365).optional(),
    classCount: z.number().min(1).max(100).optional(),
    description: z.string().max(500).optional().or(z.literal("")),
});

export type MembershipInput = z.infer<typeof membershipSchema>;

// ==========================================================
// PAYMENT SCHEMAS
// ==========================================================
export const paymentSchema = z.object({
    athleteId: z.string().min(1, "El atleta es requerido"),
    membershipId: z.string().min(1, "La membresía es requerida"),
    amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
    paymentMethod: z.enum(["CASH", "CARD", "TRANSFER"]),
    notes: z.string().max(500).optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

// ==========================================================
// COMPETITION SCHEMAS
// ==========================================================
export const competitionSchema = z.object({
    athleteId: z.string().min(1, "El atleta es requerido"),
    eventName: z.string().min(1, "El nombre del evento es requerido").max(200),
    date: z.string().min(1, "La fecha es requerida"),
    result: z.enum(["WON", "LOST", "DRAW", "PENDING"]).default("PENDING"),
    category: z.string().max(50).optional().or(z.literal("")),
    weight: z.number().min(30).max(200).optional(),
    notes: z.string().max(500).optional().or(z.literal("")),
});

export type CompetitionInput = z.infer<typeof competitionSchema>;

// ==========================================================
// CHECK-IN SCHEMAS
// ==========================================================
export const checkInPinSchema = z.object({
    pin: z.string().length(4, "El PIN debe tener 4 dígitos").regex(/^\d{4}$/, "PIN debe ser numérico"),
    token: z.string().min(1, "Token requerido"),
});

export type CheckInPinInput = z.infer<typeof checkInPinSchema>;

// ==========================================================
// SETTINGS SCHEMAS
// ==========================================================
export const gymSettingsSchema = z.object({
    gymName: z.string().min(1, "El nombre es requerido").max(100),
    timezone: z.string().min(1, "La zona horaria es requerida"),
    checkInEarlyMinutes: z.number().min(0).max(120),
    checkInLateMinutes: z.number().min(0).max(120),
});

export type GymSettingsInput = z.infer<typeof gymSettingsSchema>;

// ==========================================================
// COACH/USER SCHEMAS
// ==========================================================
export const coachSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(100),
    email: z.string().email("Email inválido"),
    pin: z.string().length(4, "El PIN debe tener 4 dígitos").regex(/^\d{4}$/, "El PIN debe ser numérico").optional(),
    role: z.enum(["ADMIN", "COACH"]).default("COACH"),
});

export type CoachInput = z.infer<typeof coachSchema>;

// ==========================================================
// EVENT SCHEMAS
// ==========================================================
export const eventSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    date: z.string().min(1, "Fecha requerida"),
    location: z.string().optional().or(z.literal("")),
    type: z.string().optional().or(z.literal("")),
    weighInDate: z.string().optional().or(z.literal("")),
});

export type EventInput = z.infer<typeof eventSchema>;

// ==========================================================
// HELPER: Safe Parse with Error Messages
// ==========================================================
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errorMessage = result.error.issues.map((e: z.ZodIssue) => e.message).join(", ");
    return { success: false, error: errorMessage };
}
