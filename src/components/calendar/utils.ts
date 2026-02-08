import { Class } from "./types";
import { parse, isBefore, isAfter, set } from "date-fns";

export type ClassStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export function getClassStatus(cls: Class, date: Date): ClassStatus {
    const now = new Date();

    // Parse times
    const [startHour, startMinute] = cls.startTime.split(':').map(Number);
    const [endHour, endMinute] = cls.endTime.split(':').map(Number);

    // Set times on the specific date of the class
    const startDate = set(date, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
    const endDate = set(date, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });

    if (isBefore(now, startDate)) {
        return 'PENDING';
    } else if (isAfter(now, endDate)) {
        return 'COMPLETED';
    } else {
        return 'IN_PROGRESS';
    }
}
