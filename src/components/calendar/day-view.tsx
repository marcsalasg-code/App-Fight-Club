"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Clock } from "lucide-react";
import { Class, CalendarEvent, TYPE_COLORS } from "./types";
import { AgendaItem } from "./agenda-item";

type Props = {
    classes: Class[];
    events: CalendarEvent[];
    currentDate: Date;
};

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 72;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export function DayView({ classes, currentDate }: Props) {
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleClassClick = (id: string) => {
        setSelectedClassId(id);
        setDetailsOpen(true);
    };

    const dayNameEnActual = format(currentDate, 'EEEE').toUpperCase();
    const dayClasses = classes
        .filter(c => c.dayOfWeek === dayNameEnActual)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const getTypeColors = (type: string) => {
        return TYPE_COLORS[type] || TYPE_COLORS.default;
    };

    return (
        <div className="flex h-full flex-col overflow-auto custom-scrollbar">

            {/* Mobile View: Simple Agenda List */}
            <div className="md:hidden p-4 space-y-3">
                {dayClasses.length > 0 ? (
                    dayClasses.map((cls) => (
                        <AgendaItem
                            key={cls.id}
                            cls={cls}
                            onClick={handleClassClick}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Clock className="h-10 w-10 mb-2 opacity-20" />
                        <p>No hay clases programadas</p>
                    </div>
                )}
            </div>

            {/* Desktop View: Full Time Grid */}
            <div className="hidden md:flex flex-col h-full">
                {/* Header */}
                <div className="grid grid-cols-[64px_1fr] border-b border-border bg-card/80 sticky top-0 z-10 backdrop-blur-md">
                    <div className="p-3 border-r border-border h-16 flex items-center justify-center text-xs font-medium text-muted-foreground">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div className="p-4 h-16 flex flex-col justify-center">
                        <span className="text-2xl font-bold tracking-tight capitalize">
                            {format(currentDate, 'EEEE d', { locale: es })}
                        </span>
                        <span className="text-sm text-muted-foreground capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 relative">
                    <div className="grid grid-cols-[64px_1fr]">
                        {/* Time Column */}
                        {HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="contents"
                            >
                                <div
                                    className="border-r border-b border-border/50 bg-card/30 flex items-start justify-end pr-2 pt-1"
                                    style={{ height: `${HOUR_HEIGHT}px` }}
                                >
                                    <span className="text-xs text-muted-foreground font-mono tabular-nums">
                                        {String(hour).padStart(2, '0')}:00
                                    </span>
                                </div>
                                <div
                                    className="border-b border-border/40 relative"
                                    style={{ height: `${HOUR_HEIGHT}px` }}
                                >
                                    {/* Half hour line */}
                                    <div
                                        className="absolute w-full border-b border-border/20"
                                        style={{ top: `${HOUR_HEIGHT / 2}px` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Classes Layer - Absolute positioned over grid */}
                    <div
                        className="absolute inset-0 grid grid-cols-[64px_1fr] pointer-events-none"
                        style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
                    >
                        <div /> {/* Spacer for time column */}
                        <div className="relative">
                            {dayClasses.map((cls) => {
                                const [startH, startM] = cls.startTime.split(":").map(Number);
                                const [endH, endM] = cls.endTime.split(":").map(Number);

                                const startMinutes = (startH - START_HOUR) * 60 + startM;
                                const durationMin = (endH * 60 + endM) - (startH * 60 + startM);

                                const top = (startMinutes / 60) * HOUR_HEIGHT;
                                const height = (durationMin / 60) * HOUR_HEIGHT;
                                const colors = getTypeColors(cls.type);

                                return (
                                    <div
                                        key={cls.id}
                                        onClick={(e) => { e.stopPropagation(); handleClassClick(cls.id); }}
                                        className="calendar-block absolute left-2 right-4 px-4 py-2 cursor-pointer overflow-hidden pointer-events-auto"
                                        style={{
                                            top: `${top}px`,
                                            height: `${Math.max(height, 40)}px`,
                                            backgroundColor: cls.color || colors.bg,
                                            borderLeft: `4px solid ${colors.border}`,
                                            color: colors.text
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-base truncate">
                                                    {cls.name}
                                                </div>
                                                <div className="text-sm opacity-90 mt-0.5">
                                                    {cls.startTime} - {cls.endTime}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm opacity-90 shrink-0 ml-4">
                                                <Users className="h-4 w-4" />
                                                <span className="font-mono tabular-nums font-semibold">
                                                    {cls._count.attendances}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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

