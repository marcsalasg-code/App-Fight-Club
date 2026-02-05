"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { MobileMonthSplitView } from "./mobile-month-split-view";
import { Class, CalendarEvent, TYPE_COLORS } from "./types";

type Props = {
    classes: Class[];
    events: CalendarEvent[];
    currentDate: Date;
};

export function MonthView({ classes, events, currentDate }: Props) {
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

    const getTypeColors = (type: string) => {
        return TYPE_COLORS[type] || TYPE_COLORS.default;
    };

    return (
        <div className="h-full">
            {/* Mobile: Split View (Mini Calendar + Agenda) */}
            <div className="md:hidden h-full">
                <MobileMonthSplitView classes={classes} events={events} currentDate={currentDate} />
            </div>

            {/* Desktop: Full Grid View */}
            <div className="hidden md:flex flex-col h-full">
                {/* Header */}
                <div className="grid grid-cols-7 border-b border-border bg-card/50">
                    {weekDays.map((day) => (
                        <div key={day} className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className={cn(
                    "flex-1 grid grid-cols-7 gap-px bg-border overflow-y-auto",
                    calendarDays.length > 35 ? "grid-rows-6" : "grid-rows-5"
                )}>
                    {calendarDays.map((day) => {
                        const dayNameEn = format(day, 'EEEE').toUpperCase();
                        const dayClasses = classes
                            .filter(c => c.dayOfWeek === dayNameEn)
                            .sort((a, b) => a.startTime.localeCompare(b.startTime));

                        const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));

                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        const totalItems = dayEvents.length + dayClasses.length;
                        /* Display priority: Events first, then classes */
                        const visibleEvents = dayEvents.slice(0, 3);
                        const remainingSlots = 3 - visibleEvents.length;
                        const visibleClasses = dayClasses.slice(0, remainingSlots);
                        const hiddenCount = totalItems - (visibleEvents.length + visibleClasses.length);

                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "bg-background p-2 flex flex-col min-h-[120px] transition-colors",
                                    !isCurrentMonth && "bg-muted/30 opacity-60",
                                    isToday && "bg-primary/5"
                                )}
                            >
                                {/* Day number */}
                                <div className="flex justify-between items-start mb-2">
                                    <span className={cn(
                                        "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full",
                                        isToday && "bg-primary text-primary-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                    {visibleEvents.map(evt => (
                                        <div
                                            key={evt.id}
                                            className="text-[11px] text-left px-2 py-1 rounded-md truncate font-medium bg-red-600 text-white shadow-sm"
                                        >
                                            <span className="font-mono opacity-80 mr-1">🏆</span>
                                            <span>{evt.name}</span>
                                        </div>
                                    ))}

                                    {visibleClasses.map(cls => {
                                        const colors = getTypeColors(cls.type);
                                        return (
                                            <button
                                                key={cls.id}
                                                onClick={(e) => handleClassClick(cls.id, e)}
                                                className="text-[11px] text-left px-2 py-1 rounded-md truncate font-medium transition-all hover:scale-[1.02] hover:shadow-sm"
                                                style={{
                                                    backgroundColor: cls.color || colors.bg,
                                                    color: colors.text
                                                }}
                                            >
                                                <span className="font-mono opacity-80">{cls.startTime}</span>
                                                <span className="mx-1">·</span>
                                                <span>{cls.name}</span>
                                            </button>
                                        );
                                    })}

                                    {hiddenCount > 0 && (
                                        <span className="text-[10px] text-muted-foreground font-medium pl-1">
                                            +{hiddenCount} más
                                        </span>
                                    )}
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
