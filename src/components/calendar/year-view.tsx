"use client";

import { useState } from "react";
import { format, startOfYear, eachMonthOfInterval, endOfYear, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
    currentDate: Date;
    onMonthSelect: (date: Date) => void;
};

export function YearView({ currentDate, onMonthSelect }: Props) {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
        <div className="h-full overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((month) => (
                    <div
                        key={month.toISOString()}
                        className={cn(
                            "border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer bg-card shadow-sm",
                            isSameMonth(month, new Date()) && "border-primary/50 bg-primary/5"
                        )}
                        onClick={() => onMonthSelect(month)}
                    >
                        <h3 className="text-lg font-bold capitalize mb-4 text-center">
                            {format(month, 'MMMM', { locale: es })}
                        </h3>

                        {/* Mini Calendar Grid Visualization (Abstract) */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground opacity-50 pointer-events-none">
                            {["L", "M", "X", "J", "V", "S", "D"].map(d => <div key={d}>{d}</div>)}
                            {/* Just dots for days to look like calendar */}
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div key={i} className="aspect-square rounded-full bg-muted-foreground/20 mx-auto w-1.5 h-1.5" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
