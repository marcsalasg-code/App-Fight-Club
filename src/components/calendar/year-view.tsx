"use client";

import { format, startOfYear, eachMonthOfInterval, endOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Class, CalendarEvent } from "./types";

type Props = {
    classes: Class[];
    events: CalendarEvent[];
    currentDate: Date;
    onMonthSelect: (date: Date) => void;
};

export function YearView({ classes, events, currentDate, onMonthSelect }: Props) {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    // Helper to get heat intensity (0-4)
    const getIntensity = (day: Date) => {
        const dayNameEn = format(day, 'EEEE').toUpperCase();
        const dailyClasses = classes.filter(c => c.dayOfWeek === dayNameEn).length;
        const dailyEvents = events.filter(e => isSameDay(new Date(e.date), day)).length;
        const total = dailyClasses + dailyEvents;

        if (total === 0) return 0;
        if (total <= 2) return 1;
        if (total <= 4) return 2;
        if (total <= 6) return 3;
        return 4;
    };

    const getIntensityColor = (intensity: number) => {
        switch (intensity) {
            case 0: return "bg-muted/30 text-muted-foreground hover:bg-muted";
            case 1: return "bg-primary/20 text-foreground hover:bg-primary/30";
            case 2: return "bg-primary/40 text-foreground hover:bg-primary/50";
            case 3: return "bg-primary/60 text-primary-foreground hover:bg-primary/70";
            case 4: return "bg-primary/90 text-primary-foreground hover:bg-primary";
            default: return "bg-muted/30";
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8">
                    {months.map((month) => {
                        const monthStart = startOfMonth(month);
                        const monthEnd = endOfMonth(month);
                        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
                        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
                        const days = eachDayOfInterval({ start: startDate, end: endDate });
                        const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

                        return (
                            <div
                                key={month.toISOString()}
                                className="flex flex-col gap-2 group cursor-pointer"
                                onClick={() => onMonthSelect(month)}
                            >
                                <h3 className="font-semibold text-lg capitalize px-1 text-foreground/80 group-hover:text-primary transition-colors">
                                    {format(month, 'MMMM', { locale: es })}
                                </h3>

                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {weekDays.map(d => (
                                        <div key={d} className="text-[10px] text-muted-foreground font-medium w-8">
                                            {d}
                                        </div>
                                    ))}

                                    {days.map((day) => {
                                        const isCurrentMonth = isSameMonth(day, month);
                                        const intensity = getIntensity(day);
                                        const isToday = isSameDay(day, new Date());

                                        if (!isCurrentMonth) {
                                            return <div key={day.toISOString()} className="w-8 h-8" />;
                                        }

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                className={cn(
                                                    "w-8 h-8 flex items-center justify-center rounded-md text-xs transition-all relative",
                                                    getIntensityColor(intensity),
                                                    isToday && "ring-2 ring-primary ring-offset-1 z-10 font-bold"
                                                )}
                                                title={`${format(day, 'd MMM')}: ${intensity} actividades`}
                                            >
                                                {format(day, 'd')}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
