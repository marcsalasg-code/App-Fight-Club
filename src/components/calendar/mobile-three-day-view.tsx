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
    const [hoveredClassId, setHoveredClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Scroll to current day on mount/update
    useEffect(() => {
        if (scrollContainerRef.current) {
            const dayIndex = weekDays.findIndex(d => isSameDay(d, currentDate));
            if (dayIndex !== -1) {
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
        const dayKey = day.toISOString();
        acc[dayKey] = classes.filter(c => c.date && isSameDay(new Date(c.date), day));
        return acc;
    }, {} as Record<string, Class[]>);

    return (
        <div className="h-full flex flex-col bg-zinc-950">
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto custom-scrollbar relative bg-zinc-950 snap-x snap-mandatory select-none"
            >
                <div className="flex" style={{ width: '233.33%' }}> {/* 7 days / 3 = 2.333 */}

                    {/* Time Column (Sticky Left) */}
                    <div className="sticky left-0 z-30 w-12 flex-none bg-zinc-950/80 backdrop-blur-md border-r border-zinc-900/60">
                        {/* Corner */}
                        <div className="h-12 sticky top-0 bg-zinc-950/90 z-40 border-b border-zinc-900/60" />

                        {/* Time labels */}
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                            <div
                                key={i}
                                className="border-b border-zinc-900/10 text-[9px] text-right pr-2 text-zinc-500 font-mono flex items-start justify-end pt-1 bg-zinc-950/45"
                                style={{ height: `${CALENDAR_CONSTANTS.HOUR_HEIGHT}px` }}
                            >
                                <span>{String(CALENDAR_CONSTANTS.START_HOUR + i).padStart(2, '0')}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {weekDays.map((day, i) => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1 border-r border-zinc-900/40 flex flex-col relative snap-start min-w-0 transition-colors",
                                    isToday ? "bg-amber-500/[0.015]" : ""
                                )}
                            >
                                {/* Header (Sticky Top) */}
                                <div className={cn(
                                    "h-12 sticky top-0 z-20 border-b border-zinc-900/60 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center gap-1.5 px-1",
                                    isToday && "border-b border-amber-500/20"
                                )}>
                                    <span className={cn(
                                        "text-[9px] uppercase font-bold tracking-wider font-sans",
                                        isToday ? "text-amber-400" : "text-zinc-500"
                                    )}>
                                        {format(day, 'EEE', { locale: es })}
                                    </span>
                                    <span className={cn(
                                        "text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full font-mono",
                                        isToday ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.25)]" : "text-zinc-300"
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
                                            className="absolute w-full border-b border-zinc-900/20 pointer-events-none"
                                            style={{ top: `${h * CALENDAR_CONSTANTS.HOUR_HEIGHT}px`, height: `${CALENDAR_CONSTANTS.HOUR_HEIGHT}px` }}
                                        >
                                            <div className="absolute w-full border-b border-zinc-900/5 top-1/2" />
                                        </div>
                                    ))}

                                    {/* Events */}
                                    {events?.filter(e => isSameDay(e.date, day)).map(event => {
                                        const eventStyle = calculateEventDimensions(event.date);

                                        return (
                                            <div
                                                key={event.id}
                                                className="absolute left-0.5 right-0.5 px-2 py-1.5 z-20 rounded-lg border shadow-lg flex flex-col justify-center bg-purple-950/20 border-purple-500/30 text-purple-200"
                                                style={{
                                                    top: eventStyle.top,
                                                    height: eventStyle.height,
                                                    backdropFilter: "blur(2px)"
                                                }}
                                            >
                                                <div className="flex items-center gap-1 font-bold text-[9px] truncate leading-tight">
                                                    <Trophy className="h-3 w-3 text-purple-400 shrink-0" />
                                                    <span className="truncate">{event.name}</span>
                                                </div>
                                                <div className="text-[8px] opacity-70 truncate font-sans tracking-wide">
                                                    COMPETICIÓN
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Classes */}
                                    {classesByDay[day.toISOString()]?.map((cls) => {
                                        const style = calculateBlockDimensions(cls.startTime, cls.endTime);
                                        const colors = getTypeColors(cls.type);
                                        const status = getClassStatus(cls, day);

                                        const isCompleted = status === 'COMPLETED';
                                        const isPending = status === 'PENDING';
                                        const isInProgress = status === 'IN_PROGRESS';

                                        const hasActiveHover = hoveredClassId !== null;
                                        const isThisHovered = hoveredClassId === cls.id;
                                        const totalBooked = cls._count?.attendances || 0;

                                        return (
                                            <div
                                                key={cls.id}
                                                onClick={() => handleClassClick(cls.id)}
                                                onMouseEnter={() => setHoveredClassId(cls.id)}
                                                onMouseLeave={() => setHoveredClassId(null)}
                                                className={cn(
                                                    "calendar-block absolute left-[3px] right-[3px] px-2 py-1.5 cursor-pointer rounded-xl border z-10 transition-all duration-350 flex flex-col justify-between shadow-md",
                                                    isCompleted && "grayscale-[0.3]",
                                                    isInProgress && "ring-1 ring-amber-500/40 ring-offset-0 scale-[1.01] shadow-[0_0_12px_rgba(245,158,11,0.1)]",
                                                    hasActiveHover && !isThisHovered ? "opacity-[0.25] blur-[0.3px]" : "opacity-100"
                                                )}
                                                style={{
                                                    ...style,
                                                    backgroundColor: cls.color || colors.bg,
                                                    borderColor: colors.border,
                                                    borderLeftWidth: "4px",
                                                    color: colors.text,
                                                    backdropFilter: "blur(4px)"
                                                }}
                                            >
                                                <div className="space-y-0.5">
                                                    <div className="flex justify-between items-start gap-1">
                                                        <h4 className="font-extrabold text-[9px] md:text-[10px] truncate leading-snug tracking-tight text-white mb-0.5">
                                                            {cls.name}
                                                        </h4>
                                                        {isCompleted && <CheckCircle2 className="h-3 w-3 text-green-400 opacity-90 shrink-0 mt-0.5" />}
                                                        {isInProgress && <Clock className="h-3 w-3 text-amber-400 animate-pulse shrink-0 mt-0.5" />}
                                                    </div>

                                                    <div className="text-[8px] opacity-75 font-mono tracking-tight font-medium">
                                                        {cls.startTime} - {cls.endTime}
                                                    </div>
                                                </div>

                                                {/* Bottom info row (Coaches and Reserved count) */}
                                                <div className="flex justify-between items-center gap-1 mt-1 text-[8px] opacity-60">
                                                    {cls.coaches && cls.coaches.length > 0 ? (
                                                        <span className="truncate max-w-[70%] font-medium">
                                                            {cls.coaches.map(c => c.name.split(" ")[0]).join(", ")}
                                                        </span>
                                                    ) : (
                                                        <span />
                                                    )}
                                                    <span className="font-mono bg-black/25 px-1 py-0.5 rounded border border-white/5">
                                                        {totalBooked}/{cls.maxCapacity}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
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
