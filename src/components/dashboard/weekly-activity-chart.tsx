"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                            dataKey="day"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        />
                        <Bar
                            dataKey="attendance"
                            name="Asistencia"
                            fill="hsl(var(--primary))"
                            radius={[6, 6, 0, 0]}
                            className="fill-primary"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
