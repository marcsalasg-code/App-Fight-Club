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
    const normCode = typeCode.toUpperCase().replace(/\s+/g, "_");
    if (TYPE_COLORS[normCode]) {
        return TYPE_COLORS[normCode];
    }
    const typeData = dynamicTypes.find(t => t.code === typeCode);
    if (typeData) {
        const hex = typeData.color || "#8E8E93";
        return {
            bg: hexToRgba(hex, 0.12),
            border: hex,
            text: "#FFFFFF"
        };
    }
    return TYPE_COLORS.default;
}

export function hexToRgba(hex: string, alpha: number = 0.15): string {
    const cleanHex = hex.replace("#", "");
    const match = cleanHex.match(/.{1,2}/g);
    if (!match) return hex;
    const [r, g, b] = match.map(x => parseInt(x, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Shortens a class name to initials or clear short codes
 */
export function getShortClassName(name: string): string {
    const clean = name.trim();
    if (!clean) return "";

    const upper = clean.toUpperCase();

    // Check known categories
    if (upper.includes("MUAY THAI")) {
        return upper.includes("MAÑANA") ? "MT AM" : upper.includes("MEDIODÍA") || upper.includes("TARDE") ? "MT PM" : "MT";
    }
    if (upper.includes("CALISTENIA")) return "CAL";
    if (upper.includes("WOMAN") || upper.includes("FUNCIONAL")) {
        if (upper.includes("WOMAN") && upper.includes("FUNCIONAL")) return "WF";
        return upper.includes("WOMAN") ? "W-FUNC" : "FUNC";
    }
    if (upper.includes("JIU JITSU") || upper.includes("BJJ")) return "BJJ";
    if (upper.includes("WRESTLING") || upper.includes("LUCHA")) return "LCH";
    if (upper.includes("BOXING") || upper.includes("BOXEO")) return "BOX";
    if (upper.includes("KIDS") || upper.includes("NIÑOS")) return "KID";

    const words = clean.split(/\s+/);
    if (words.length > 1) {
        return words.map(w => w[0].toUpperCase()).join("");
    }
    return clean.slice(0, 3).toUpperCase();
}
