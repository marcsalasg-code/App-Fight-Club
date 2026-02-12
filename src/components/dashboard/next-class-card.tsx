"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClassData {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    color: string;
    maxCapacity: number;
    attendancesCount: number;
    dayOfWeek?: string;
}

interface NextClassCardProps {
    nextClass: ClassData | null;
}

export function NextClassCard({ nextClass }: NextClassCardProps) {
    if (!nextClass) {
        return (
            <Card className="h-full border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground p-6">
                    <Clock className="h-10 w-10 mb-4 opacity-20" />
                    <p>No hay clases próximas hoy.</p>
                    <Link href="/calendario" className="mt-4">
                        <Button variant="outline" size="sm">
                            Ver Calendario
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const now = new Date();
    const [hours, minutes] = nextClass.startTime.split(":").map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);

    const isLive = now >= classTime; // Simplistic "is live" check, refined by end time in real logic
    const timeToStart = formatDistanceToNow(classTime, { addSuffix: true, locale: es });

    return (
        <Card className="h-full border-l-4 overflow-hidden relative" style={{ borderLeftColor: nextClass.color }}>
            {/* Background Accent */}
            <div
                className="absolute right-0 top-0 h-full w-1/3 opacity-[0.03] pointer-events-none"
                style={{ backgroundColor: nextClass.color }}
            />

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 bg-background/50 backdrop-blur-sm">
                            {isLive ? "EN CURSO" : "PRÓXIMA CLASE"}
                        </Badge>
                        <CardTitle className="text-2xl font-bold">{nextClass.name}</CardTitle>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold font-mono text-primary">
                            {nextClass.startTime}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            hasta {nextClass.endTime}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                                {isLive ? "Comenzó hace " : "Comienza "}{timeToStart}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                                {nextClass.attendancesCount} / {nextClass.maxCapacity} inscritos
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <Link href={`/clases/${nextClass.id}/checkin`} className="flex-1">
                            <Button className="w-full gap-2" size="lg">
                                {isLive ? "Gestionar Clase" : "Iniciar Check-in"}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
