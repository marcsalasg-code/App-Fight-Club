"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Users } from "lucide-react";
import { Class, CalendarEvent, TYPE_COLORS } from "./types";
import { MobileThreeDayView } from "./mobile-three-day-view";

type Props = {
    classes: Class[];
    events: CalendarEvent[]; // Kept for consistency though unused in grid currently
    currentDate: Date;
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 64;
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

    const getClassStyle = (cls: Class) => {
        const [startH, startM] = cls.startTime.split(":").map(Number);
        const [endH, endM] = cls.endTime.split(":").map(Number);
        const startMinutes = (startH - START_HOUR) * 60 + startM;
        const endMinutes = (endH - START_HOUR) * 60 + endM;
        const durationMinutes = endMinutes - startMinutes;
        const top = (startMinutes / 60) * HOUR_HEIGHT;
        const height = (durationMinutes / 60) * HOUR_HEIGHT;
        return { top: `${top}px`, height: `${Math.max(height, 32)}px` };
    };

    const getTypeColors = (type: string) => TYPE_COLORS[type] || TYPE_COLORS.default;

    const classesByDay = DAYS.reduce((acc, day) => {
        acc[day] = classes.filter(c => c.dayOfWeek === day);
        return acc;
    }, {} as Record<string, Class[]>);

    return (
        <div className="h-full">
            {/* Mobile: 3-Day Swipe View */}
            <div className="md:hidden h-full">
                <MobileThreeDayView classes={classes} currentDate={currentDate} />
            </div>

            {/* Desktop: Full week grid */}
            <div className="hidden md:flex h-full flex-col overflow-auto custom-scrollbar">
                {/* Header */}
                <div className="flex border-b border-border bg-card/80 sticky top-0 z-20 backdrop-blur-md">
                    <div className="w-14 shrink-0 p-3 text-center text-xs font-medium text-muted-foreground border-r border-border">
                        <span>Hora</span>
                    </div>
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex-1 py-3 px-2 text-center border-r border-border min-w-[140px] transition-colors",
                                isSameDay(day, new Date()) && "bg-primary/10"
                            )}
                        >
                            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {format(day, 'EEE', { locale: es })}
                            </div>
                            <div className={cn(
                                "text-xl font-bold mt-0.5",
                                isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                            )}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Body */}
                <div className="flex flex-1 min-w-[900px]">
                    {/* Time column */}
                    <div className="w-14 shrink-0 border-r border-border bg-card/50">
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                            <div
                                key={i}
                                className="border-b border-border/50 text-xs text-right pr-2 text-muted-foreground font-mono flex items-start justify-end pt-1"
                                style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                                <span className="tabular-nums">{String(START_HOUR + i).padStart(2, '0')}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {DAYS.map((day, dayIndex) => (
                        <div
                            key={day}
                            className={cn(
                                "flex-1 border-r border-border relative min-w-[140px]",
                                isSameDay(weekDays[dayIndex], new Date()) && "bg-primary/5"
                            )}
                            style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
                        >
                            {/* Hour grid lines */}
                            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-full border-b border-border/40"
                                    style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                                />
                            ))}

                            {/* Half-hour lines */}
                            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                                <div
                                    key={`half-${i}`}
                                    className="absolute w-full border-b border-border/20"
                                    style={{ top: `${i * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                                />
                            ))}

                            {/* Classes */}
                            {classesByDay[day]?.map((cls) => {
                                const style = getClassStyle(cls);
                                const colors = getTypeColors(cls.type);
                                return (
                                    <div
                                        key={cls.id}
                                        onClick={() => handleClassClick(cls.id)}
                                        className="calendar-block absolute left-1 right-1 px-2.5 py-1.5 cursor-pointer overflow-hidden z-10 group"
                                        style={{
                                            ...style,
                                            backgroundColor: cls.color || colors.bg,
                                            borderLeft: `3px solid ${colors.border}`,
                                            color: colors.text
                                        }}
                                    >
                                        <div className="font-bold text-sm truncate leading-tight">
                                            {cls.name}
                                        </div>
                                        <div className="text-xs opacity-90 truncate mt-0.5">
                                            {cls.startTime} - {cls.endTime}
                                        </div>
                                        <div className="absolute bottom-1.5 right-2 flex items-center gap-1 text-[10px] opacity-80">
                                            <Users className="h-3 w-3" />
                                            <span className="font-mono tabular-nums">{cls._count.attendances}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <ClassDetailModal
                classId={selectedClassId}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </div>
    );
}


