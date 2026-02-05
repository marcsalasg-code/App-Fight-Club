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
};

export type CalendarEvent = {
    id: string;
    name: string;
    date: Date;
    status: string;
};

export const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    "MMA": { bg: "rgba(196, 30, 58, 0.95)", border: "#C41E3A", text: "#FFFFFF" },
    "BJJ": { bg: "rgba(37, 99, 235, 0.95)", border: "#2563EB", text: "#FFFFFF" },
    "MUAY_THAI": { bg: "rgba(217, 119, 6, 0.95)", border: "#D97706", text: "#FFFFFF" },
    "WRESTLING": { bg: "rgba(22, 163, 74, 0.95)", border: "#16A34A", text: "#FFFFFF" },
    "BOXING": { bg: "rgba(139, 92, 246, 0.95)", border: "#8B5CF6", text: "#FFFFFF" },
    "CONDITIONING": { bg: "rgba(212, 175, 55, 0.95)", border: "#D4AF37", text: "#000000" },
    "KIDS": { bg: "rgba(236, 72, 153, 0.95)", border: "#EC4899", text: "#FFFFFF" },
    "default": { bg: "rgba(212, 175, 55, 0.95)", border: "#D4AF37", text: "#000000" }
};
