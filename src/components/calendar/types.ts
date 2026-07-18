export type ViewMode = 'year' | 'month' | 'week' | 'day';

export type Class = {
    id: string;
    name: string;
    type: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    color: string;
    _count: { attendances: number };
    date?: Date;
    isSubstitute?: boolean;
    overrideId?: string;
};

export type CalendarEvent = {
    id: string;
    name: string;
    date: Date;
    status: string;
};

export const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    "MMA": { bg: "rgba(255, 59, 48, 0.12)", border: "#FF3B30", text: "#FFFFFF" },
    "BJJ": { bg: "rgba(0, 122, 255, 0.12)", border: "#007AFF", text: "#FFFFFF" },
    "MUAY_THAI": { bg: "rgba(255, 149, 0, 0.12)", border: "#FF9500", text: "#FFFFFF" },
    "WRESTLING": { bg: "rgba(52, 199, 89, 0.12)", border: "#34C759", text: "#FFFFFF" },
    "BOXING": { bg: "rgba(175, 82, 222, 0.12)", border: "#AF52DE", text: "#FFFFFF" },
    "CONDITIONING": { bg: "rgba(88, 86, 214, 0.12)", border: "#5856D6", text: "#FFFFFF" },
    "KIDS": { bg: "rgba(255, 45, 85, 0.12)", border: "#FF2D55", text: "#FFFFFF" },
    "default": { bg: "rgba(142, 142, 147, 0.12)", border: "#8E8E93", text: "#FFFFFF" }
};
