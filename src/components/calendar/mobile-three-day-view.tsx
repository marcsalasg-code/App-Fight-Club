"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Class, TYPE_COLORS } from "./types";

type Props = {
    classes: Class[];
    currentDate: Date;
};

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 64;
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;

export function MobileThreeDayView({ classes, currentDate }: Props) {
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
                                style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                                <span>{String(START_HOUR + i).padStart(2, '0')}:00</span>
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
                            <div className="relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
                                {/* Horizontal Grid Lines */}
                                {Array.from({ length: TOTAL_HOURS }, (_, h) => (
                                    <div
                                        key={h}
                                        className="absolute w-full border-b border-border/40 pointer-events-none"
                                        style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                                    >
                                        <div className="absolute w-full border-b border-border/10 top-1/2" />
                                    </div>
                                ))}

                                {/* Classes */}
                                {classesByDay[format(day, 'EEEE').toUpperCase()]?.map((cls) => {
                                    const style = getClassStyle(cls);
                                    const colors = getTypeColors(cls.type);
                                    return (
                                        <div
                                            key={cls.id}
                                            onClick={() => handleClassClick(cls.id)}
                                            className="absolute left-0.5 right-0.5 px-1 py-1 cursor-pointer overflow-hidden z-10 rounded-sm"
                                            style={{
                                                ...style,
                                                backgroundColor: cls.color || colors.bg,
                                                borderLeft: `2px solid ${colors.border}`,
                                                color: colors.text
                                            }}
                                        >
                                            <div className="font-bold text-[10px] truncate leading-tight">
                                                {cls.name}
                                            </div>
                                            <div className="text-[9px] opacity-90 truncate -mt-0.5">
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
