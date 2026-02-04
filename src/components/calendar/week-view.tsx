"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

type Class = {
    id: string;
    name: string;
    type: string;
    dayOfWeek: string;
    startTime: string; // "HH:mm"
    endTime: string;
    color: string;
    _count: { attendances: number };
};

type Props = {
    classes: Class[];
    currentDate: Date;
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 60; // pixels per hour
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;

export function WeekView({ classes, currentDate }: Props) {
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const handleClassClick = (id: string) => {
        setSelectedClassId(id);
        setDetailsOpen(true);
    };

    // Calculate position and height for a class
    const getClassStyle = (cls: Class) => {
        const [startH, startM] = cls.startTime.split(":").map(Number);
        const [endH, endM] = cls.endTime.split(":").map(Number);

        const startMinutes = (startH - START_HOUR) * 60 + startM;
        const endMinutes = (endH - START_HOUR) * 60 + endM;
        const durationMinutes = endMinutes - startMinutes;

        return {
            top: `${startMinutes}px`,
            height: `${durationMinutes}px`,
        };
    };

    // Group classes by day
    const classesByDay = DAYS.reduce((acc, day) => {
        acc[day] = classes.filter(c => c.dayOfWeek === day);
        return acc;
    }, {} as Record<string, Class[]>);

    return (
        <div className="flex h-full flex-col overflow-auto">
            {/* Header */}
            <div className="flex border-b bg-muted/40 sticky top-0 z-20 backdrop-blur-sm">
                <div className="w-16 shrink-0 p-2 text-center text-xs text-muted-foreground border-r">
                    Hora
                </div>
                {weekDays.map((day, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex-1 p-2 text-center border-r min-w-[130px]",
                            isSameDay(day, new Date()) && "bg-primary/10"
                        )}
                    >
                        <div className="text-xs uppercase opacity-70">
                            {format(day, 'EEE', { locale: es })}
                        </div>
                        <div className={cn(
                            "text-lg font-semibold",
                            isSameDay(day, new Date()) && "text-primary"
                        )}>
                            {format(day, 'd')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Body with time slots and classes */}
            <div className="flex flex-1 min-w-[800px]">
                {/* Time column */}
                <div className="w-16 shrink-0 border-r bg-muted/5">
                    {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                        <div
                            key={i}
                            className="border-b text-xs text-right pr-2 text-muted-foreground font-mono"
                            style={{ height: `${HOUR_HEIGHT}px` }}
                        >
                            <span className="relative -top-2">{START_HOUR + i}:00</span>
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                {DAYS.map((day, dayIndex) => (
                    <div
                        key={day}
                        className={cn(
                            "flex-1 border-r relative min-w-[130px]",
                            isSameDay(weekDays[dayIndex], new Date()) && "bg-primary/5"
                        )}
                        style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
                    >
                        {/* Hour lines */}
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                            <div
                                key={i}
                                className="absolute w-full border-b border-border/50"
                                style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                            />
                        ))}

                        {/* Classes */}
                        {classesByDay[day]?.map((cls) => {
                            const style = getClassStyle(cls);
                            return (
                                <div
                                    key={cls.id}
                                    onClick={() => handleClassClick(cls.id)}
                                    className="absolute left-1 right-1 rounded-md px-2 py-1 text-sm font-medium shadow-sm hover:brightness-110 cursor-pointer overflow-hidden transition-all border border-black/10 z-10"
                                    style={{
                                        ...style,
                                        backgroundColor: cls.color || "#D4AF37",
                                        color: 'rgba(0,0,0,0.85)'
                                    }}
                                >
                                    <div className="font-bold truncate">{cls.name}</div>
                                    <div className="truncate opacity-80 text-xs">
                                        {cls.startTime} - {cls.endTime}
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-black/20 px-1 rounded text-[10px] text-white/90 font-mono">
                                        {cls._count.attendances}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <ClassDetailModal
                classId={selectedClassId}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </div>
    );
}
