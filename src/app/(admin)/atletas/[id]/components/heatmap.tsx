"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { eachDayOfInterval, endOfYear, format, getDay, isSameDay, startOfYear, subYears } from "date-fns"
import { es } from "date-fns/locale"

interface AttendanceHeatmapProps {
    data: Date[]
}

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
    const today = new Date()
    // Show last 365 days or just current year?
    // User plan said "Heatmap Anual".
    // Let's show last 12 months roughly.
    const endDate = today
    const startDate = subYears(today, 1)

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    // Group by level (0 = none, 1 = 1 class, 2 = 2+ classes)
    // Actually just binary for now or count based.
    // If multiple classes in one day?

    // Convert data to map for O(1) lookup
    // Map<DateString, Count>
    const attendanceMap = new Map<string, number>()
    data.forEach(date => {
        const key = format(date, "yyyy-MM-dd")
        attendanceMap.set(key, (attendanceMap.get(key) || 0) + 1)
    })

    const getIntensity = (count: number) => {
        if (count === 0) return "bg-muted"
        if (count === 1) return "bg-green-500/40"
        if (count === 2) return "bg-green-500/70"
        return "bg-green-500"
    }

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-1 min-w-[800px]">
                {/* We need to grid it by weeks. Columns = weeks, Rows = days (Mon-Sun or Sun-Sat) */}
                {/* 52 weeks */}

                {/* We can construct a grid of 53 columns x 7 rows */}
                {/* This is a bit complex for a simple flex. */}
                {/* Let's simplify: Just render a grid with CSS grid */}

                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {/* Empty cells for offset if start date is not Sunday/Monday */}
                    {Array.from({ length: getDay(startDate) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-3 h-3" />
                    ))}

                    {days.map(day => {
                        const key = format(day, "yyyy-MM-dd")
                        const count = attendanceMap.get(key) || 0
                        return (
                            <TooltipProvider key={key}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div
                                            className={cn("w-3 h-3 rounded-[2px] transition-colors", getIntensity(count))}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">
                                            {format(day, "PPP", { locale: es })}: {count} {count === 1 ? "clase" : "clases"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <span>Menos</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-muted rounded-[2px]" />
                    <div className="w-3 h-3 bg-green-500/40 rounded-[2px]" />
                    <div className="w-3 h-3 bg-green-500/70 rounded-[2px]" />
                    <div className="w-3 h-3 bg-green-500 rounded-[2px]" />
                </div>
                <span>Más</span>
            </div>
        </div>
    )
}
