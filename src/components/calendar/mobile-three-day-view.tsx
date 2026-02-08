"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Trophy, CheckCircle2, Clock } from "lucide-react";
import { Class, CalendarEvent, TYPE_COLORS } from "./types";
import { getClassStatus } from "./utils";
import { useClassTypes } from "@/hooks/use-class-types"; // Added import

type Props = {
    classes: Class[];
    events?: CalendarEvent[];
    currentDate: Date;
};

import { CALENDAR_CONSTANTS, TOTAL_HOURS, TOTAL_HEIGHT, calculateBlockDimensions, calculateEventDimensions, resolveClassColors } from "./calendar-engine";

export function MobileThreeDayView({ classes, events, currentDate }: Props) {
    const { types: classTypes } = useClassTypes(); // Hook usage
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Scroll to current day on mount/update
    useEffect(() => {
        if (scrollContainerRef.current) {
            const dayIndex = weekDays.findIndex(d => isSameDay(d, currentDate));
            if (dayIndex !== -1) {
                // Approximate scroll to keep current day starting the view
                // Each column is roughly 1/3 of view, but let's just scroll to the day index * (1/3 view width)
                // Actually safer to scroll to dayIndex * (containerWidth / 3) assuming we set min-w properly
                // Since min-w is relative to viewport (33vw), we can calculate:
                const widthPerDay = window.innerWidth / 3;
                scrollContainerRef.current.scrollTo({ left: dayIndex * widthPerDay, behavior: 'smooth' });
            }
        }
    }, [currentDate, weekDays]);

    const handleClassClick = (id: string) => {
        setSelectedClassId(id);
        setDetailsOpen(true);
    };

    const getTypeColors = (type: string) => resolveClassColors(type, classTypes);

    const classesByDay = weekDays.reduce((acc, day) => {
        const dayName = format(day, 'EEEE').toUpperCase();
        acc[dayName] = classes.filter(c => c.dayOfWeek === dayName);
        return acc;
    }, {} as Record<string, Class[]>);

    return (
        <div className="h-full flex flex-col">
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto custom-scrollbar relative bg-background snap-x snap-mandatory"
            >
                <div className="flex" style={{ width: '233.33%' }}> {/* 7 days / 3 = 2.333 */}

                    {/* Time Column (Sticky Left) */}
                    <div className="sticky left-0 z-30 w-12 flex-none bg-background border-r border-border">
                        {/* Corner */}
                        <div className="h-12 sticky top-0 bg-background z-40 border-b border-border" />

                        {/* Time labels */}
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                            <div
                                key={i}
                                className="border-b border-border/50 text-[10px] text-right pr-1 text-muted-foreground font-mono flex items-start justify-end pt-1 bg-background"
                                style={{ height: `${CALENDAR_CONSTANTS.HOUR_HEIGHT}px` }}
                            >
                                <span>{String(CALENDAR_CONSTANTS.START_HOUR + i).padStart(2, '0')}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            className="flex-1 border-r border-border flex flex-col relative snap-start min-w-0" // min-w-0 helps flex sizing
                        >
                            {/* Header (Sticky Top) */}
                            <div className={cn(
                                "h-12 sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-sm flex items-center justify-center gap-1.5",
                                isSameDay(day, new Date()) && "bg-primary/5"
                            )}>
                                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                                    {format(day, 'EEE', { locale: es })}
                                </span>
                                <span className={cn(
                                    "text-sm font-bold h-6 w-6 flex items-center justify-center rounded-full",
                                    isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
                                {/* Horizontal Grid Lines */}
                                {Array.from({ length: TOTAL_HOURS }, (_, h) => (
                                    <div
                                        key={h}
                                        className="absolute w-full border-b border-border/40 pointer-events-none"
                                        style={{ top: `${h * CALENDAR_CONSTANTS.HOUR_HEIGHT}px`, height: `${CALENDAR_CONSTANTS.HOUR_HEIGHT}px` }}
                                    >
                                        <div className="absolute w-full border-b border-border/10 top-1/2" />
                                    </div>
                                ))}

                                {/* Events */}
                                {events?.filter(e => isSameDay(e.date, day)).map(event => {
                                    const eventStyle = calculateEventDimensions(event.date);

                                    return (
                                        <div
                                            key={event.id}
                                            className="absolute left-0.5 right-0.5 px-1 py-1 z-20 rounded-sm border shadow-sm flex flex-col justify-center"
                                            style={{
                                                top: eventStyle.top,
                                                height: eventStyle.height,
                                                backgroundColor: "rgba(147, 51, 234, 0.9)",
                                                borderColor: "#7e22ce",
                                                color: "white"
                                            }}
                                        >
                                            <div className="flex items-center gap-1 font-bold text-[10px] truncate leading-tight">
                                                <Trophy className="h-3 w-3 text-yellow-300 shrink-0" />
                                                <span className="truncate">{event.name}</span>
                                            </div>
                                            <div className="text-[9px] opacity-90 truncate -mt-0.5">
                                                Competencia
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Classes */}
                                {classesByDay[format(day, 'EEEE').toUpperCase()]?.map((cls) => {
                                    const style = calculateBlockDimensions(cls.startTime, cls.endTime); // Use engine
                                    const colors = getTypeColors(cls.type);
                                    const status = getClassStatus(cls, day);

                                    // Status Styles (Same as WeekView)
                                    const isCompleted = status === 'COMPLETED';
                                    const isPending = status === 'PENDING';
                                    const isInProgress = status === 'IN_PROGRESS';

                                    return (
                                        <div
                                            key={cls.id}
                                            onClick={() => handleClassClick(cls.id)}
                                            className={cn(
                                                "absolute left-0.5 right-0.5 px-1 py-1 cursor-pointer overflow-hidden z-10 rounded-md border transition-all duration-200",
                                                isCompleted && "opacity-70 grayscale-[0.3]",
                                                isInProgress && "ring-1 ring-primary ring-offset-0 shadow-sm z-20"
                                            )}
                                            style={{
                                                ...style,
                                                backgroundColor: cls.color || colors.bg,
                                                borderColor: colors.border,
                                                borderLeftWidth: "3px",
                                                color: colors.text
                                            }}
                                        >
                                            <div className="flex justify-between items-start gap-0.5">
                                                <div className="font-bold text-[10px] truncate leading-tight">
                                                    {cls.name}
                                                </div>
                                                {isCompleted && <CheckCircle2 className="h-2.5 w-2.5 opacity-80 shrink-0" />}
                                                {isInProgress && <Clock className="h-2.5 w-2.5 animate-pulse shrink-0" />}
                                                {isPending && <div className="h-1 w-1 rounded-full bg-current opacity-60 mt-0.5 ml-auto shrink-0" />}
                                            </div>

                                            <div className="text-[9px] opacity-95 truncate -mt-0.5 font-mono tracking-tight">
                                                {cls.startTime}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
