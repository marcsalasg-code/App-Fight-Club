"use client";

import { format, addDays, startOfWeek, endOfWeek, endOfMonth, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ViewMode } from "./types";

type Props = {
    date: Date;
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
    onNavigate: (direction: 'prev' | 'next') => void;
    onToday: () => void;
};

export function CalendarHeader({ date, view, onViewChange, onNavigate, onToday }: Props) {

    // Helper to generate the context description string
    const getContextLabel = () => {
        switch (view) {
            case 'day':
                return format(date, "EEEE d 'de' MMMM", { locale: es });
            case 'week': {
                const start = startOfWeek(date, { weekStartsOn: 1 });
                const end = endOfWeek(date, { weekStartsOn: 1 });

                // If same month: "12 - 18 Octubre"
                if (isSameMonth(start, end)) {
                    return `${format(start, 'd')} - ${format(end, 'd')} ${format(end, 'MMMM', { locale: es })}`;
                }
                // Different months: "29 Sep - 05 Oct"
                return `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM', { locale: es })}`;
            }
            case 'month':
                return format(date, 'MMMM yyyy', { locale: es });
            case 'year':
                return format(date, 'yyyy');
            default:
                return "";
        }
    };

    return (
        <div className="flex flex-col gap-4 pb-4 border-b">
            {/* Top Row: Title/Selector + View Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Mobile Title (Clickable in future for DatePicker) */}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold capitalize flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            {format(date, 'MMMM yyyy', { locale: es })}
                            {/* <ChevronDown className="h-4 w-4 opacity-50" /> Future DatePicker */}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onToday} className="hidden md:flex">
                        Hoy
                    </Button>
                    <Select value={view} onValueChange={(v) => onViewChange(v as ViewMode)}>
                        <SelectTrigger className="w-[110px] h-9">
                            <SelectValue placeholder="Vista" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="day">Día</SelectItem>
                            <SelectItem value="week">Semana</SelectItem>
                            <SelectItem value="month">Mes</SelectItem>
                            <SelectItem value="year">Año</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bottom Row: Navigation + Context Indicator */}
            <div className="flex items-center justify-between bg-muted/30 p-1 rounded-lg border">
                <Button variant="ghost" size="icon" onClick={() => onNavigate('prev')} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm font-medium capitalize text-muted-foreground animate-in fade-in">
                    {getContextLabel()}
                </span>

                <Button variant="ghost" size="icon" onClick={() => onNavigate('next')} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Mobile "Today" Shortcut (if not visible in top row) */}
            <div className="md:hidden flex justify-end -mt-2">
                <Button variant="link" size="sm" onClick={onToday} className="text-xs h-auto p-0 text-primary">
                    Volver a hoy
                </Button>
            </div>
        </div>
    );
}
