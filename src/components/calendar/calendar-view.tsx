"use client";

import { useState, useEffect } from "react";
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { DayView } from "./day-view";
import { YearView } from "./year-view";
import { NewClassModal } from "./new-class-modal";
import { NewCompetitionModal } from "./new-competition-modal";
import { CalendarHeader } from "./calendar-header";
import { Button } from "@/components/ui/button";
import { Class, CalendarEvent, ViewMode } from "./types";
import { getCalendarSchedule } from "@/actions/schedule";

type Props = {
    classes: Class[];
    events: CalendarEvent[];
};

export function CalendarView({ classes, events }: Props) {
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState<ViewMode>('week');
    const [schedule, setSchedule] = useState<any[]>(classes);
    const [loading, setLoading] = useState(false);

    // Fetch dynamic schedule when date changes
    useEffect(() => {
        let active = true;
        async function fetchSchedule() {
            setLoading(true);
            try {
                const monthStart = startOfMonth(date);
                const monthEnd = endOfMonth(monthStart);
                const rangeStart = startOfWeek(monthStart, { weekStartsOn: 1 });
                const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

                const data = await getCalendarSchedule(rangeStart, rangeEnd);
                if (active) {
                    // Map key fields to match expected Class object shape if necessary
                    const formatted = data.map(item => ({
                        ...item,
                        id: item.classId, // Compatibility mapping
                    }));
                    setSchedule(formatted);
                }
            } catch (error) {
                console.error("Failed to load dynamic schedule:", error);
            } finally {
                if (active) setLoading(false);
            }
        }
        fetchSchedule();
        return () => {
            active = false;
        };
    }, [date]);

    // Load saved view preference from localStorage
    useEffect(() => {
        const savedView = localStorage.getItem('calendar-view');
        if (savedView && ['year', 'month', 'week', 'day'].includes(savedView)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setView(savedView as ViewMode);
        }
    }, []);

    // Save view preference to localStorage when it changes
    const handleViewChange = (newView: ViewMode) => {
        setView(newView);
        localStorage.setItem('calendar-view', newView);
    };

    const navigate = (direction: 'prev' | 'next') => {
        switch (view) {
            case 'year':
                setDate(prev => direction === 'prev' ? subYears(prev, 1) : addYears(prev, 1));
                break;
            case 'month':
                setDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
                break;
            case 'week':
                setDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
                break;
            case 'day':
                setDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
                break;
        }
    };

    const handleToday = () => setDate(new Date());

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <CalendarHeader
                    date={date}
                    view={view}
                    onViewChange={handleViewChange}
                    onNavigate={navigate}
                    onToday={handleToday}
                />
                <div className="flex justify-end gap-2">
                    <NewCompetitionModal />
                    <NewClassModal />
                </div>
            </div>

            {/* Views */}
            <div className="flex-1 min-h-[600px] bg-background rounded-lg border shadow-sm isolate">
                {view === 'week' && <WeekView classes={schedule} events={events} currentDate={date} />}
                {view === 'month' && <MonthView classes={schedule} events={events} currentDate={date} />}
                {view === 'year' && <YearView classes={schedule} events={events} currentDate={date} onMonthSelect={(d) => { setDate(d); setView('month'); }} />}
                {view === 'day' && <DayView classes={schedule} events={events} currentDate={date} />}
            </div>
        </div>
    );
}
