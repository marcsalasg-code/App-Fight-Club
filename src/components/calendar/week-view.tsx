"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Trophy, CheckCircle2, Clock } from "lucide-react";
import { Class, CalendarEvent, TYPE_COLORS } from "./types";
import { MobileThreeDayView } from "./mobile-three-day-view";
import { getClassStatus } from "./utils";
import { useClassTypes } from "@/hooks/use-class-types";
import { rescheduleClass, checkCoachAvailability } from "@/actions/classes";
import { toast } from "sonner";

type Props = {
    classes: Class[];
    events: CalendarEvent[]; // Kept for consistency though unused in grid currently
    currentDate: Date;
};

import { CALENDAR_CONSTANTS, TOTAL_HOURS, TOTAL_HEIGHT, calculateBlockDimensions, calculateEventDimensions, resolveClassColors, hexToRgba, getShortClassName, timeToMinutes } from "./calendar-engine";

export function WeekView({ classes, events, currentDate }: Props) {
    const { types: classTypes } = useClassTypes();
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [hoveredClassId, setHoveredClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [now, setNow] = useState(new Date());

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, targetDay: string) => {
        e.preventDefault();
        const classId = e.dataTransfer.getData("text/plain");
        if (!classId) return;

        const cls = classes.find(c => c.id === classId);
        if (!cls) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - rect.top;

        const calendarStartMinutes = CALENDAR_CONSTANTS.START_HOUR * 60;
        const dropMinutes = (clickY / CALENDAR_CONSTANTS.HOUR_HEIGHT) * 60;
        const startMinutesTotal = calendarStartMinutes + dropMinutes;

        // Snap to nearest 15 minutes for usability
        const roundedStartMinutes = Math.round(startMinutesTotal / 15) * 15;

        // Calculate original duration
        const duration = timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime);

        const newStartHour = Math.floor(roundedStartMinutes / 60);
        const newStartMin = roundedStartMinutes % 60;

        const endMinutesTotal = roundedStartMinutes + duration;
        const newEndHour = Math.floor(endMinutesTotal / 60);
        const newEndMin = endMinutesTotal % 60;

        const newStartTime = `${String(Math.min(23, Math.max(0, newStartHour))).padStart(2, '0')}:${String(newStartMin).padStart(2, '0')}`;
        const newEndTime = `${String(Math.min(23, Math.max(0, newEndHour))).padStart(2, '0')}:${String(newEndMin).padStart(2, '0')}`;

        if (newStartHour < CALENDAR_CONSTANTS.START_HOUR || newEndHour > CALENDAR_CONSTANTS.END_HOUR) {
            toast.error("La clase debe permanecer dentro del horario visible (06:00 - 22:00)");
            return;
        }
        // Check for coach availability conflicts
        const coachIds = cls.coaches?.map(c => c.id) || [];
        if (coachIds.length > 0) {
            try {
                const check = await checkCoachAvailability(coachIds, targetDay, newStartTime, newEndTime, classId);
                if (check.success && check.conflict) {
                    const proceed = window.confirm(`¡Advertencia de Conflicto de Entrenador!:\n${check.message}\n\n¿Deseas reprogramarla de todas formas?`);
                    if (!proceed) return;
                }
            } catch (err) {
                console.error(err);
            }
        }

        try {
            const res = await rescheduleClass(classId, targetDay, newStartTime, newEndTime);
            if (res.success) {
                toast.success(`Clase reprogramada para el ${targetDay.toLowerCase()} de ${newStartTime} a ${newEndTime}`);
            } else {
                toast.error(res.error || "Error al reprogramar la clase");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al comunicarse con el servidor");
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const getNowIndicatorPos = () => {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        if (hours < CALENDAR_CONSTANTS.START_HOUR || hours >= CALENDAR_CONSTANTS.END_HOUR) return null;

        const relativeMinutes = (hours - CALENDAR_CONSTANTS.START_HOUR) * 60 + minutes;
        return (relativeMinutes / 60) * CALENDAR_CONSTANTS.HOUR_HEIGHT;
    };

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const handleClassClick = (id: string) => {
        setSelectedClassId(id);
        setDetailsOpen(true);
    };

    const getTypeColors = (type: string) => resolveClassColors(type, classTypes);

    const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

    const classesByDay = DAYS.reduce((acc, day, dayIndex) => {
        const targetDate = weekDays[dayIndex];
        acc[day] = classes.filter(c => c.date && isSameDay(new Date(c.date), targetDate));
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
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day)}
                            className={cn(
                                "flex-1 border-r border-border/50 relative min-w-[140px] transition-colors",
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

                            {/* Current Time Indicator */}
                            {isSameDay(weekDays[dayIndex], new Date()) && getNowIndicatorPos() !== null && (
                                <div
                                    className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                                    style={{ top: `${getNowIndicatorPos()}px` }}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.25 shrink-0 shadow-sm relative">
                                        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                                    </div>
                                    <div className="flex-1 h-0.5 bg-red-500" />
                                </div>
                            )}

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
                                        onMouseEnter={() => setHoveredClassId(cls.id)}
                                        onMouseLeave={() => setHoveredClassId(null)}
                                        draggable={true}
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", cls.id);
                                            e.dataTransfer.effectAllowed = "move";
                                        }}
                                        className={cn(
                                            "absolute left-[4px] right-[4px] px-2 py-1.5 cursor-pointer z-10 rounded-r-lg border border-border border-l-[3px] bg-zinc-950/80 hover:bg-zinc-900 transition-all active:cursor-grabbing",
                                            isCompleted && "opacity-55 grayscale-[0.2]",
                                            isInProgress && "ring-1 ring-white/30 scale-[1.01]",
                                            hoveredClassId !== null && hoveredClassId !== cls.id && "opacity-25 blur-[0.3px] scale-[0.98]"
                                        )}
                                        style={{
                                            ...style,
                                            borderLeftColor: colors.border,
                                        }}
                                    >
                                        <div className="flex flex-col h-full justify-between">
                                            <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span
                                                        style={{ backgroundColor: colors.border }}
                                                        className="text-[9px] font-extrabold text-white px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0 shadow-sm"
                                                    >
                                                        {getShortClassName(cls.name)}
                                                    </span>
                                                    {isInProgress && <Clock className="h-3 w-3 text-red-500 animate-pulse shrink-0" />}
                                                    {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />}
                                                </div>
                                                <div className="text-[10px] text-zinc-400 mt-1 font-mono leading-none tracking-tight">
                                                    {cls.startTime} - {cls.endTime}
                                                </div>
                                            </div>

                                            {/* Attendance Count */}
                                            <div className="absolute bottom-1 right-1 flex items-center gap-1 text-[9px] bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 px-1 py-0.5 rounded font-mono">
                                                <Users className="h-2.5 w-2.5 opacity-70" />
                                                <span>{cls._count.attendances}</span>
                                            </div>
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
        </div >
    );
}


