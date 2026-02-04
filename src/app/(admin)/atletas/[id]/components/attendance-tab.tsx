"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceHeatmap } from "./heatmap"
import { AttendanceStats } from "./attendance-stats"
import { startOfWeek, subWeeks } from "date-fns"
import { ExportButton } from "@/components/ui/export-button"

interface AttendanceTabProps {
    attendances: {
        id: string
        date: Date
        class: {
            name: string
            type: string
        }
    }[]
}

export function AttendanceTab({ attendances }: AttendanceTabProps) {
    // 1. Prepare data for heatmap
    const heatMapData = attendances.map(a => new Date(a.date))

    // 2. Calculate Stats
    const totalClasses = attendances.length

    // Weekly Average (based on first attendance or 1 year?)
    // Let's use last 12 months for average context
    const weeksInYear = 52
    const weeklyAverage = totalClasses / weeksInYear
    // Or better: from first attendance date to now?
    // Let's stick to "yearly activity" context.

    // Current Streak
    // Check backwards from this week
    let currentStreak = 0
    const sortedDates = [...heatMapData].sort((a, b) => b.getTime() - a.getTime())

    if (sortedDates.length > 0) {
        const checkWeek = new Date() // Start checking from now
        // Loop backwards
        // This is a simplified streak check.
        // Identify active weeks.
        const activeWeeks = new Set(
            sortedDates.map(d => startOfWeek(d).getTime())
        )

        // Count consecutive active weeks backwards from today
        let weekCursor = startOfWeek(new Date())

        // Allow streak to be kept if attended this week OR last week?
        // Usually streak implies "current unbroken chain".
        while (activeWeeks.has(weekCursor.getTime())) {
            currentStreak++
            weekCursor = subWeeks(weekCursor, 1)
        }
    }

    // Favorite Class
    const classCounts: Record<string, number> = {}
    attendances.forEach(a => {
        const name = a.class.name
        classCounts[name] = (classCounts[name] || 0) + 1
    })

    let favoriteClass = ""
    let maxCount = 0
    Object.entries(classCounts).forEach(([name, count]) => {
        if (count > maxCount) {
            maxCount = count
            favoriteClass = name
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Análisis de Asistencia</h3>
                <ExportButton
                    data={attendances.map(a => ({
                        Fecha: new Date(a.date).toLocaleDateString(),
                        Clase: a.class.name,
                        Tipo: a.class.type,
                    }))}
                    columns={[
                        { header: "Fecha", key: "Fecha" },
                        { header: "Clase", key: "Clase" },
                        { header: "Tipo", key: "Tipo" },
                    ]}
                    fileName="asistencia_detalle"
                    title="Historial de Asistencia"
                />
            </div>

            <AttendanceStats
                totalClasses={totalClasses}
                weeklyAverage={weeklyAverage}
                currentStreak={currentStreak}
                favoriteClass={favoriteClass}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Actividad del último año</CardTitle>
                </CardHeader>
                <CardContent>
                    <AttendanceHeatmap data={heatMapData} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historial Detallado</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Reuse basic table or create a quick one */}
                    <div className="rounded-md border">
                        <div className="max-h-[400px] overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left font-medium">Fecha</th>
                                        <th className="p-3 text-left font-medium">Clase</th>
                                        <th className="p-3 text-left font-medium">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.map(a => (
                                        <tr key={a.id} className="border-t hover:bg-muted/50">
                                            <td className="p-3">
                                                {new Date(a.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 font-medium">{a.class.name}</td>
                                            <td className="p-3 text-muted-foreground">{a.class.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
