// Shared TypeScript types for the gym manager application

// ==========================================================
// CLASS TYPES
// ==========================================================
export type ClassData = {
    id: string;
    name: string;
    type: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    color: string | null;
    levelRequired: string | null;
    maxCapacity: number;
    active: boolean;
    coachId: string | null;
    coach?: { id: string; name: string } | null;
    _count?: { attendances: number };
};

export type ClassDetailData = {
    id: string;
    name: string;
    type: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    color: string | null;
    levelRequired: string | null;
    maxCapacity: number;
    active: boolean;
    coach?: { id: string; name: string } | null;
    attendances: AttendanceRecord[];
};

export type AttendanceRecord = {
    id: string;
    checkInTime: Date | string;
    method: string;
    athlete: {
        id: string;
        firstName: string;
        lastName: string;
        photoUrl: string | null;
    };
};

// ==========================================================
// ATHLETE TYPES
// ==========================================================
export type AthleteBasic = {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
};

export type AthleteCreateData = {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    pin?: string | null;
    dateOfBirth?: Date | null;
    emergencyContact?: string | null;
    medicalConditions?: string | null;
    height?: number | null;
    weight?: number | null;
    level: string;
    goal: string;
    isCompetitor: boolean;
    competitionCategory?: string | null;
};

// ==========================================================
// COMPETITION TYPES
// ==========================================================
export type Competition = {
    id: string;
    athleteId: string;
    eventName: string;
    date: Date | string;
    result: string;
    category: string | null;
    weight: number | null;
    notes: string | null;
    athlete?: {
        firstName: string;
        lastName: string;
    };
};

// ==========================================================
// API RESPONSE TYPES
// ==========================================================
export type ActionResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};
