"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ClassDetailModal } from "./class-detail-modal";
import { AgendaItem } from "./agenda-item";
import { Class, CalendarEvent, TYPE_COLORS } from "./types";
import { Clock } from "lucide-react";

type Props = {
    classes: Class[];
    events: CalendarEvent[];
    currentDate: Date;
};

export function MobileMonthSplitView({ classes, events, currentDate }: Props) {
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Sync state if currentDate changes externally (e.g. from header nav)
    useEffect(() => {
        // Only update if the month changed, to keep day selection stable if within month?
        // Or always sync? Plan says "Smart Navigation".
        // If I navigate "Next Month", selectedDate should update to start of month or keep day?
        // Usually currentDate from CalendarView is "today" or "1st of month".
        // Let's defer to currentDate.
        if (!isSameMonth(currentDate, selectedDate)) {
            setSelectedDate(currentDate);
        }
    }, [currentDate]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    };

    const handleClassClick = (id: string) => {
        setSelectedClassId(id);
        setDetailsOpen(true);
    };

    // Prepare data for dots
    const getDayInfo = (day: Date) => {
        const dayNameEn = format(day, 'EEEE').toUpperCase();
        const hasClasses = classes.some(c => c.dayOfWeek === dayNameEn);
        const hasEvents = events.some(e => isSameDay(new Date(e.date), day));
        return { hasClasses, hasEvents };
    };

    // Filter classes for SELECTED date
    const selectedDayName = format(selectedDate, 'EEEE').toUpperCase();
    const selectedDayClasses = classes
        .filter(c => c.dayOfWeek === selectedDayName)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="flex bg-background h-full flex-col">
            {/* Top Half: Mini Calendar */}
            <div className="shrink-0 border-b border-border bg-card/50 pb-2 shadow-sm z-10">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                    {weekDays.map((day) => (
                        <div key={day} className="text-center text-[10px] py-2 text-muted-foreground font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1">
                    {calendarDays.map((day, i) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        const { hasClasses, hasEvents } = getDayInfo(day);

                        return (
                            <div
                                key={day.toISOString()}
                                className="flex flex-col items-center justify-center cursor-pointer relative h-9"
                                onClick={() => handleDayClick(day)}
                            >
                                <div className={cn(
                                    "h-7 w-7 flex items-center justify-center rounded-full text-sm transition-all",
                                    isSelected ? "bg-primary text-primary-foreground font-bold shadow-md scale-105" :
                                        isToday ? "text-primary font-bold bg-primary/10" :
                                            !isCurrentMonth ? "text-muted-foreground/30" : "text-foreground hover:bg-muted"
                                )}>
                                    {format(day, 'd')}
                                </div>
                                <div className="flex gap-0.5 mt-0.5 h-1">
                                    {hasEvents && <div className="w-1 h-1 rounded-full bg-red-500" />}
                                    {hasClasses && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-primary-foreground" : "bg-primary/50")} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Half: Agenda List */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-muted/5 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold capitalize text-muted-foreground">
                        {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </h3>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {selectedDayClasses.length} clases
                    </span>
                </div>

                <div className="space-y-3">
                    {selectedDayClasses.length > 0 ? (
                        selectedDayClasses.map((cls) => (
                            <AgendaItem
                                key={cls.id}
                                cls={cls}
                                onClick={handleClassClick}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/60">
                            <Clock className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No hay clases</p>
                        </div>
                    )}
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
