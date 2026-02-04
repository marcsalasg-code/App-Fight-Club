"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";

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

type Props = {
    classes: Class[];
    currentDate: Date;
};

export function MonthView({ classes, currentDate }: Props) {
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    const handleClassClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedClassId(id);
        setDetailsOpen(true);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="grid grid-cols-7 border-b bg-muted/20">
                {weekDays.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className={cn("flex-1 grid grid-cols-7 bg-muted/20 gap-px overflow-y-auto", calendarDays.length > 35 ? "grid-rows-6" : "grid-rows-5")}>
                {calendarDays.map((day) => {
                    const dayNameEn = format(day, 'EEEE').toUpperCase(); // MONDAY, TUESDAY...

                    // Filter classes for this day
                    const dayClasses = classes.filter(c => c.dayOfWeek === dayNameEn)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "bg-background p-1 flex flex-col gap-1 min-h-[100px] hover:bg-muted/5 transition-colors",
                                !isSameMonth(day, monthStart) && "bg-muted/5 text-muted-foreground",
                                isSameDay(day, new Date()) && "bg-primary/5"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                    isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[140px] custom-scrollbar">
                                {dayClasses.map(cls => (
                                    <button
                                        key={cls.id}
                                        onClick={(e) => handleClassClick(cls.id, e)}
                                        className="text-[11px] text-left px-1.5 py-0.5 rounded truncate font-medium hover:brightness-95 transition-all shadow-sm"
                                        style={{
                                            backgroundColor: cls.color || "#D4AF37",
                                            color: 'rgba(0,0,0,0.85)'
                                        }}
                                    >
                                        {cls.startTime} {cls.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <ClassDetailModal
                classId={selectedClassId}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </div>
    );
}
