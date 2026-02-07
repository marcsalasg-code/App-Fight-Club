"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ActivityData = {
    day: string
    attendance: number
}

interface WeeklyActivityChartProps {
    data: ActivityData[]
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Actividad Semanal</CardTitle>
                <CardDescription>
                    Asistencia de los últimos 7 días
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }}
                            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        />
                        <Bar
                            dataKey="attendance"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            className="fill-primary"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
