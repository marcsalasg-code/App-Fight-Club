"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Users } from "lucide-react";

type Class = {
    id: string;
    name: string;
    type: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    color: string;
    _count: { attendances: number };
};


type CalendarEvent = {
    id: string;
    name: string;
    date: Date;
    status: string;
};

type Props = {
    classes: Class[];
    events: CalendarEvent[];
    currentDate: Date;
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 64;
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;

// Type colors based on class type
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    "MMA": { bg: "rgba(196, 30, 58, 0.9)", border: "#C41E3A", text: "#FFFFFF" },
    "BJJ": { bg: "rgba(37, 99, 235, 0.9)", border: "#2563EB", text: "#FFFFFF" },
    "MUAY_THAI": { bg: "rgba(217, 119, 6, 0.9)", border: "#D97706", text: "#FFFFFF" },
    "WRESTLING": { bg: "rgba(22, 163, 74, 0.9)", border: "#16A34A", text: "#FFFFFF" },
    "BOXING": { bg: "rgba(139, 92, 246, 0.9)", border: "#8B5CF6", text: "#FFFFFF" },
    "CONDITIONING": { bg: "rgba(212, 175, 55, 0.9)", border: "#D4AF37", text: "#000000" },
    "KIDS": { bg: "rgba(236, 72, 153, 0.9)", border: "#EC4899", text: "#FFFFFF" },
    "default": { bg: "rgba(212, 175, 55, 0.9)", border: "#D4AF37", text: "#000000" }
};

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

    const getTypeColors = (type: string) => {
        return TYPE_COLORS[type] || TYPE_COLORS.default;
    };

    const classesByDay = DAYS.reduce((acc, day) => {
        acc[day] = classes.filter(c => c.dayOfWeek === day);
        return acc;
    }, {} as Record<string, Class[]>);

    return (
        <div className="flex h-full flex-col overflow-auto custom-scrollbar">
            {/* Mobile: Vertical day schedule */}
            <div className="md:hidden">
                <div className="p-4 border-b border-border bg-card/80">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-lg font-bold capitalize">
                                {format(currentDate, 'EEEE', { locale: es })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {format(currentDate, 'd MMMM', { locale: es })}
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {classesByDay[format(currentDate, 'EEEE').toUpperCase()]?.length || 0} clases
                        </div>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    {(classesByDay[format(currentDate, 'EEEE').toUpperCase()] || [])
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((cls) => {
                            const colors = getTypeColors(cls.type);
                            return (
                                <div
                                    key={cls.id}
                                    onClick={() => handleClassClick(cls.id)}
                                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                                    style={{ borderLeftWidth: 4, borderLeftColor: colors.border }}
                                >
                                    <div className="text-sm font-mono text-muted-foreground shrink-0 w-16">
                                        {cls.startTime}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{cls.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {cls.startTime} - {cls.endTime}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                                        <Users className="h-4 w-4" />
                                        <span>{cls._count.attendances}</span>
                                    </div>
                                </div>
                            );
                        })}
                    {(!classesByDay[format(currentDate, 'EEEE').toUpperCase()] ||
                        classesByDay[format(currentDate, 'EEEE').toUpperCase()].length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                                No hay clases programadas para este día
                            </div>
                        )}
                </div>
            </div>

            {/* Desktop: Full week grid */}
            <div className="hidden md:block">
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

