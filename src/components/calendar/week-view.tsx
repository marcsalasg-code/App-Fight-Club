"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Trophy, CheckCircle2, Clock } from "lucide-react";
import { Class, CalendarEvent, TYPE_COLORS } from "./types";
import { MobileThreeDayView } from "./mobile-three-day-view";
import { getClassStatus } from "./utils";
import { useClassTypes } from "@/hooks/use-class-types";

type Props = {
    classes: Class[];
    events: CalendarEvent[]; // Kept for consistency though unused in grid currently
    currentDate: Date;
};

import { CALENDAR_CONSTANTS, TOTAL_HOURS, TOTAL_HEIGHT, calculateBlockDimensions, calculateEventDimensions, resolveClassColors } from "./calendar-engine";

export function WeekView({ classes, events, currentDate }: Props) {
    const { types: classTypes } = useClassTypes();
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const handleClassClick = (id: string) => {
        setSelectedClassId(id);
        setDetailsOpen(true);
    };

    const getTypeColors = (type: string) => resolveClassColors(type, classTypes);

    const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

    const classesByDay = DAYS.reduce((acc, day) => {
        acc[day] = classes.filter(c => c.dayOfWeek === day);
        return acc;
    }, {} as Record<string, Class[]>);

    return (
        <div className="h-full">
            {/* Mobile: 3-Day Swipe View */}
            <div className="md:hidden h-full">
                <MobileThreeDayView classes={classes} events={events} currentDate={currentDate} />
            </div>

            {/* Desktop: Full week grid */}
            <div className="hidden md:flex h-full flex-col overflow-auto custom-scrollbar bg-background/50">
                {/* Header */}
                <div className="flex border-b border-border bg-background/95 sticky top-0 z-20 backdrop-blur-sm">
                    <div className="w-14 shrink-0 p-3 text-center text-xs font-medium text-muted-foreground border-r border-border">
                        <span className="sr-only">Hora</span>
                    </div>
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex-1 py-3 px-2 text-center border-r border-border min-w-[140px] transition-colors",
                                isSameDay(day, new Date()) && "bg-primary/5"
                            )}
                        >
                            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {format(day, 'EEE', { locale: es })}
                            </div>
                            <div className={cn(
                                "text-xl font-bold mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full",
                                isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "text-foreground"
                            )}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Body */}
                <div className="flex flex-1 min-w-[900px]">
                    {/* Time column */}
                    <div className="w-14 shrink-0 border-r border-border bg-background">
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                            <div
                                key={i}
                                className="border-b border-border/30 text-xs text-right pr-2 text-muted-foreground font-mono flex items-start justify-end pt-1"
                                style={{ height: `${CALENDAR_CONSTANTS.HOUR_HEIGHT}px` }}
                            >
                                <span className="tabular-nums opacity-50">{String(CALENDAR_CONSTANTS.START_HOUR + i).padStart(2, '0')}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {DAYS.map((day, dayIndex) => (
                        <div
                            key={day}
                            className={cn(
                                "flex-1 border-r border-border/50 relative min-w-[140px]",
                                isSameDay(weekDays[dayIndex], new Date()) && "bg-primary/5"
                            )}
                            style={{ height: `${TOTAL_HEIGHT}px` }}
                        >
                            {/* Hour grid lines - Subtler */}
                            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-full border-b border-dashed border-border/30 pointer-events-none"
                                    style={{ top: `${i * CALENDAR_CONSTANTS.HOUR_HEIGHT}px`, height: `${CALENDAR_CONSTANTS.HOUR_HEIGHT}px` }}
                                />
                            ))}

                            {/* Events */}
                            {events.filter(e => isSameDay(e.date, weekDays[dayIndex])).map(event => {
                                const eventStyle = calculateEventDimensions(event.date);

                                return (
                                    <div
                                        key={event.id}
                                        className="absolute left-1 right-1 px-2 py-1 z-20 rounded-md border shadow-sm flex flex-col justify-center group hover:scale-[1.02] transition-transform"
                                        style={{
                                            top: eventStyle.top,
                                            height: eventStyle.height,
                                            backgroundColor: "rgba(147, 51, 234, 0.9)",
                                            borderColor: "#7e22ce",
                                            color: "white"
                                        }}
                                        title={event.name}
                                    >
                                        <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                                            <Trophy className="h-3 w-3 text-yellow-300 shrink-0" />
                                            <span className="truncate">{event.name}</span>
                                        </div>
                                        <div className="text-[10px] opacity-90 truncate">
                                            Competencia
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Classes */}
                            {classesByDay[day]?.map((cls) => {
                                const style = calculateBlockDimensions(cls.startTime, cls.endTime);
                                const colors = getTypeColors(cls.type);
                                const status = getClassStatus(cls, weekDays[dayIndex]);

                                // Status Styles
                                const isCompleted = status === 'COMPLETED';
                                const isPending = status === 'PENDING';
                                const isInProgress = status === 'IN_PROGRESS';

                                return (
                                    <div
                                        key={cls.id}
                                        onClick={() => handleClassClick(cls.id)}
                                        className={cn(
                                            "absolute left-1 right-1 px-2 py-1 cursor-pointer overflow-hidden z-10 rounded-md border transition-all duration-200 group hover:shadow-md",
                                            isCompleted && "opacity-60 grayscale-[0.3]",
                                            isInProgress && "ring-2 ring-primary ring-offset-1 shadow-lg scale-[1.01]"
                                        )}
                                        style={{
                                            ...style,
                                            backgroundColor: cls.color || colors.bg,
                                            borderColor: colors.border,
                                            borderLeftWidth: "4px",
                                            color: colors.text
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-xs truncate leading-tight pr-4">
                                                {cls.name}
                                            </div>
                                            {isCompleted && <CheckCircle2 className="h-3 w-3 opacity-70 shrink-0" />}
                                            {isInProgress && <Clock className="h-3 w-3 animate-pulse shrink-0" />}
                                        </div>

                                        <div className="text-[10px] opacity-90 truncate mt-0.5 font-mono">
                                            {cls.startTime} - {cls.endTime}
                                        </div>

                                        {/* Attendance Count */}
                                        <div className="absolute bottom-1 right-1 flex items-center gap-1 text-[9px] bg-black/10 px-1 py-0.5 rounded-sm backdrop-blur-[1px]">
                                            <Users className="h-2.5 w-2.5" />
                                            <span className="font-mono">{cls._count.attendances}</span>
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


