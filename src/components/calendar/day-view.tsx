"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClassDetailSheet } from "./class-detail-sheet";
import { format } from "date-fns";
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

const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export function DayView({ classes, currentDate }: Props) {
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleClassClick = (id: string) => {
        setSelectedClassId(id);
        setDetailsOpen(true);
    };

    const currentDayName = format(currentDate, 'EEEE', { locale: es }).toUpperCase(); // "LUNES"...
    // Fix: format is localized. DB is English "MONDAY".
    // We need map or get English name.
    const dayNameEn = format(currentDate, 'EEEE').toUpperCase();
    // Actually, 'date-fns' default is En-US if no locale passed, but here I imported 'es'.
    // Wait, to get English I should NOT pass locale.
    const dayNameEnActual = format(currentDate, 'EEEE').toUpperCase();

    // Filter only classes for this day
    const dayClasses = classes.filter(c => c.dayOfWeek === dayNameEnActual);

    return (
        <div className="flex h-full flex-col overflow-auto">
            <div className="grid grid-cols-[60px_1fr] border-b bg-muted/40 text-center text-sm font-medium sticky top-0 z-10 backdrop-blur-sm">
                <div className="p-2 border-r h-12 flex items-center justify-center text-xs text-muted-foreground">Hora</div>
                <div className="p-2 h-12 flex flex-col items-center justify-center text-primary font-bold">
                    <span className="capitalize">{format(currentDate, 'EEEE d MMMM', { locale: es })}</span>
                </div>
            </div>

            <div className="grid grid-cols-[60px_1fr] grid-rows-[repeat(17,60px)] divide-y divide-x min-w-[300px]">
                {/* Time Column */}
                {HOURS.map((hour) => (
                    <div key={hour} className="row-span-1 border-r bg-muted/10 p-2 text-xs text-right text-muted-foreground font-mono sticky left-0 bg-background/95">
                        {hour}:00
                    </div>
                ))}

                {/* Grid Cells Background */}
                {/* We rely on the container grid, but we need horizontal lines. */}
                {/* Actually, the divide-y creates lines between rows. */}

                {/* Classes Layer */}
                {/* Since we have only 1 day column, we can iterate classes and place them. */}
                {dayClasses.map((cls) => {
                    const [startH, startM] = cls.startTime.split(":").map(Number);
                    const [endH, endM] = cls.endTime.split(":").map(Number);

                    const rowStart = (startH - START_HOUR) + 1;

                    const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
                    const heightPixels = durationMin * (60 / 60);
                    const topOffset = (startM / 60) * 60;

                    return (
                        <div
                            key={cls.id}
                            onClick={(e) => { e.stopPropagation(); handleClassClick(cls.id); }}
                            className="mr-4 ml-1 rounded p-2 text-sm font-medium text-black shadow-sm hover:brightness-110 cursor-pointer overflow-hidden transition-all relative group z-10 hover:z-20 border border-black/10"
                            style={{
                                gridColumn: 2,
                                gridRow: `${rowStart} / span 1`,
                                height: `${heightPixels}px`,
                                marginTop: `${topOffset}px`,
                                backgroundColor: cls.color || "#D4AF37",
                                opacity: 0.95
                            }}
                        >
                            <div className="font-bold flex justify-between">
                                <span>{cls.name}</span>
                                <span className="opacity-80 text-xs">{cls.startTime} - {cls.endTime}</span>
                            </div>
                            <div className="mt-1 text-xs opacity-80 flex items-center gap-1">
                                <span>👥 {cls._count.attendances} Atletas</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ClassDetailSheet
                classId={selectedClassId}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </div>
    );
}
