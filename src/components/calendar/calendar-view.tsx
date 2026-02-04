"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { DayView } from "./day-view";
import { YearView } from "./year-view";
import { NewClassModal } from "./new-class-modal";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ViewMode = 'year' | 'month' | 'week' | 'day';

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
};

export function CalendarView({ classes }: Props) {
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState<ViewMode>('week');

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
            {/* Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleToday}>Hoy</Button>
                    <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold ml-2 capitalize">
                        {format(date, view === 'year' ? 'yyyy' : view === 'day' ? 'PPPP' : 'MMMM yyyy', { locale: es })}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={view} onValueChange={(v) => handleViewChange(v as ViewMode)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Vista" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="year">Año</SelectItem>
                            <SelectItem value="month">Mes</SelectItem>
                            <SelectItem value="week">Semana</SelectItem>
                            <SelectItem value="day">Día</SelectItem>
                        </SelectContent>
                    </Select>
                    <NewClassModal />
                </div>
            </div>

            {/* Views */}
            <div className="flex-1 min-h-[600px] bg-background rounded-lg border shadow-sm isolate">
                {view === 'week' && <WeekView classes={classes} currentDate={date} />}
                {view === 'month' && <MonthView classes={classes} currentDate={date} />}
                {view === 'year' && <YearView currentDate={date} onMonthSelect={(d) => { setDate(d); setView('month'); }} />}
                {view === 'day' && <DayView classes={classes} currentDate={date} />}
            </div>
        </div>
    );
}
