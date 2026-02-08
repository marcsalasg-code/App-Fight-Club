import { Class, TYPE_COLORS } from "./types";

// ==========================================================
// CONSTANTS
// ==========================================================
export const CALENDAR_CONSTANTS = {
    START_HOUR: 6,
    END_HOUR: 22,
    HOUR_HEIGHT: 64,
};

// Derived constants
export const TOTAL_HOURS = CALENDAR_CONSTANTS.END_HOUR - CALENDAR_CONSTANTS.START_HOUR + 1;
export const TOTAL_HEIGHT = TOTAL_HOURS * CALENDAR_CONSTANTS.HOUR_HEIGHT;

// ==========================================================
// TIME & POSITION CALCULATIONS
// ==========================================================

/**
 * Converts a time string "HH:mm" to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}

/**
 * Calculates top and height for a time block
 * @param startTime "HH:mm"
 * @param endTime "HH:mm"
 */
export function calculateBlockDimensions(startTime: string, endTime: string) {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Calculate minutes relative to calendar start hour
    const calendarStartMinutes = CALENDAR_CONSTANTS.START_HOUR * 60;

    const relativeStart = startMinutes - calendarStartMinutes;
    const duration = endMinutes - startMinutes;

    const top = (relativeStart / 60) * CALENDAR_CONSTANTS.HOUR_HEIGHT;
    const height = (duration / 60) * CALENDAR_CONSTANTS.HOUR_HEIGHT;

    return {
        top: `${Math.max(0, top)}px`,
        height: `${Math.max(height, 32)}px` // Minimum height 32px
    };
}

/**
 * Calculates top and height for an event at a specific Date
 * @param date Date object
 * @param durationMinutes Duration in minutes (default 60)
 */
export function calculateEventDimensions(date: Date, durationMinutes: number = 60) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // If outside bounds, return null or clamped?
    // Current logic in views: check bounds inside render loop.
    // We'll return 0 if outside standard day view logic, or let caller decide.

    const startMinutes = hours * 60 + minutes;
    const calendarStartMinutes = CALENDAR_CONSTANTS.START_HOUR * 60;

    const relativeStart = startMinutes - calendarStartMinutes;

    if (relativeStart < 0) return { top: "0px", height: "0px" }; // Or handle late night events

    const top = (relativeStart / 60) * CALENDAR_CONSTANTS.HOUR_HEIGHT;
    const height = (durationMinutes / 60) * CALENDAR_CONSTANTS.HOUR_HEIGHT;

    return {
        top: `${top}px`,
        height: `${Math.max(height, 32)}px`
    };
}

// ==========================================================
// COLOR RESOLUTION
// ==========================================================

export function resolveClassColors(typeCode: string, dynamicTypes: any[]) {
    const typeData = dynamicTypes.find(t => t.code === typeCode);
    if (typeData) {
        return {
            bg: typeData.color,
            border: typeData.borderColor,
            text: typeData.color === "#D4AF37" ? "#000000" : "#FFFFFF"
        };
    }
    return TYPE_COLORS[typeCode] || TYPE_COLORS.default;
}
