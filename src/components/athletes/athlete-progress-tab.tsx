"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend
} from "recharts";

interface AthleteProgressTabProps {
    attendances: any[]; // Using any for simplicity in this view component, ideally strictly typed
    weighIns: any[];
    isCompetitor: boolean;
}

export function AthleteProgressTab({ attendances, weighIns, isCompetitor }: AthleteProgressTabProps) {

    // Process Attendance Data: Group by Month (Last 6 months)
    const attendanceData = processAttendanceData(attendances);

    // Process WeighIn Data: Sort by Date
    const weighInData = weighIns
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(w => ({
            date: format(new Date(w.date), "d MMM", { locale: es }),
            weight: w.weight,
            fullDate: w.date
        }));

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Attendance Chart */}
            <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                    <CardTitle>Constancia de Entrenamiento</CardTitle>
                    <CardDescription>Sesiones por mes (últimos 6 meses)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(var(--primary), 0.1)' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    name="Sesiones"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Weight Chart - Only for Competitors or if data exists */}
            {(isCompetitor || weighIns.length > 0) && (
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle>Evolución de Peso</CardTitle>
                        <CardDescription>Historial de pesajes registrados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {weighIns.length < 2 ? (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                Se necesitan al menos 2 registros para ver la gráfica
                            </div>
                        ) : (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={weighInData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            unit="kg"
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
                                            activeDot={{ r: 6 }}
                                            name="Peso (kg)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function processAttendanceData(attendances: any[]) {
    // 1. Get last 6 months buckets
    const today = new Date();
    const buckets: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = format(d, "MMM yyyy", { locale: es }); // e.g., "feb 2024"
        // Capitalize month
        buckets[key.charAt(0).toUpperCase() + key.slice(1)] = 0;
    }

    // 2. Fill buckets
    attendances.forEach(att => {
        const date = new Date(att.date);
        const key = format(date, "MMM yyyy", { locale: es });
        const properKey = key.charAt(0).toUpperCase() + key.slice(1);

        if (buckets[properKey] !== undefined) {
            buckets[properKey]++;
        }
    });

    // 3. Convert to array
    return Object.entries(buckets).map(([month, count]) => ({
        month,
        count
    }));
}
