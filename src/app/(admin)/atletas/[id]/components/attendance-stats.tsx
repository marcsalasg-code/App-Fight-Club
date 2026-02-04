"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CalendarDays, Flame, Trophy } from "lucide-react"

interface AttendanceStatsProps {
    totalClasses: number
    weeklyAverage: number
    currentStreak: number
    favoriteClass: string
}

export function AttendanceStats({ totalClasses, weeklyAverage, currentStreak, favoriteClass }: AttendanceStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Clases
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalClasses}</div>
                    <p className="text-xs text-muted-foreground">
                        En el último año
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Promedio Semanal
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{weeklyAverage.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                        Clases por semana
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Racha Actual
                    </CardTitle>
                    <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentStreak}</div>
                    <p className="text-xs text-muted-foreground">
                        Semanas consecutivas
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Clase Favorita
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold truncate text-sm" title={favoriteClass}>
                        {favoriteClass || "-"}
                    </div>
                    <p className="text-xs text-muted-foreground pl-1">
                        Más asistida
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
