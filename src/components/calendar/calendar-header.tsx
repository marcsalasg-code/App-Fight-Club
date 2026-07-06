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
                    {/* Mobile Title */}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold capitalize flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            {format(date, 'MMMM yyyy', { locale: es })}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onToday} className="hidden md:flex h-9 px-3">
                        Hoy
                    </Button>

                    {/* Desktop Segmented Tabs */}
                    <div className="hidden md:flex items-center bg-muted p-1 rounded-lg border border-border">
                        {(['day', 'week', 'month', 'year'] as const).map((viewOption) => (
                            <button
                                key={viewOption}
                                onClick={() => onViewChange(viewOption)}
                                className={cn(
                                    "px-3 py-1 text-xs font-semibold rounded-md transition-all uppercase tracking-wider",
                                    view === viewOption
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {viewOption === 'day' ? 'Día' :
                                    viewOption === 'week' ? 'Semana' :
                                        viewOption === 'month' ? 'Mes' : 'Año'}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Selector */}
                    <div className="md:hidden">
                        <Select value={view} onValueChange={(v) => onViewChange(v as ViewMode)}>
                            <SelectTrigger className="w-[100px] h-9 bg-muted/50 border-border">
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
            </div>

            {/* Bottom Row: Navigation + Context Indicator */}
            <div className="flex items-center justify-between bg-card p-1.5 rounded-xl border border-border shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate('prev')}
                    className="h-8 w-8 hover:bg-muted rounded-lg"
                >
                    <ChevronLeft className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>

                <span className="text-base font-semibold capitalize text-foreground px-4 tracking-tight">
                    {getContextLabel()}
                </span>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate('next')}
                    className="h-8 w-8 hover:bg-muted rounded-lg"
                >
                    <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
            </div>

            {/* Mobile "Today" Shortcut */}
            <div className="md:hidden flex justify-center -mt-2">
                <button
                    onClick={onToday}
                    className="text-xs h-7 px-3 bg-muted/30 border border-border text-muted-foreground hover:text-foreground rounded-full transition-all"
                >
                    Volver a hoy
                </button>
            </div>
        </div>
    );
}
