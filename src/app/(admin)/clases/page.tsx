import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Users, Calendar, QrCode } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = 'force-dynamic';

async function getClasses() {
    return prisma.class.findMany({
        where: { active: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: {
            coaches: { select: { name: true } },
            _count: { select: { attendances: true } },
        },
    });
}

const dayOrder: Record<string, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
};

const dayLabels: Record<string, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

const typeColors: Record<string, string> = {
    MUAY_THAI: "bg-red-500/10 text-red-700 border-red-200",
    KICKBOXING: "bg-orange-500/10 text-orange-700 border-orange-200",
    SPARRING: "bg-purple-500/10 text-purple-700 border-purple-200",
    CONDITIONING: "bg-blue-500/10 text-blue-700 border-blue-200",
    COMPETITION: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
};

const typeLabels: Record<string, string> = {
    MUAY_THAI: "Muay Thai",
    KICKBOXING: "Kickboxing",
    SPARRING: "Sparring",
    CONDITIONING: "Acondicionamiento",
    COMPETITION: "Competición",
};

export default async function ClassesPage() {
    const classes = await getClasses();

    // Group by day
    const classesByDay = classes.reduce(
        (acc, cls) => {
            if (!acc[cls.dayOfWeek]) acc[cls.dayOfWeek] = [];
            acc[cls.dayOfWeek].push(cls);
            return acc;
        },
        {} as Record<string, typeof classes>
    );

    const sortedDays = Object.keys(classesByDay).sort(
        (a, b) => dayOrder[a] - dayOrder[b]
    );

    return (
        <div className="space-y-6">

            <PageHeader
                title="Clases"
                subtitle="Gestiona el horario de clases"
                action={
                    <Link href="/clases/nueva">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Nueva Clase</span>
                        </Button>
                    </Link>
                }
            />

            {classes.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                            No hay clases configuradas
                        </p>
                        <Link href="/clases/nueva">
                            <Button>Crear primera clase</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {sortedDays.map((day) => (
                        <div key={day}>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                {dayLabels[day]}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {classesByDay[day].map((cls) => (
                                    <Card key={cls.id} className="hover:shadow-lg transition-shadow bg-card">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{cls.name}</span>
                                                <Badge className={typeColors[cls.type]}>
                                                    {typeLabels[cls.type]}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        {cls.startTime} - {cls.endTime}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Users className="h-4 w-4" />
                                                        Capacidad: {cls.maxCapacity}
                                                    </div>
                                                    {cls.coaches && cls.coaches.length > 0 && (
                                                        <p className="text-muted-foreground">
                                                            Coach: {cls.coaches.map(c => c.name).join(", ")}
                                                        </p>
                                                    )}
                                                    {cls.levelRequired && (
                                                        <Badge variant="outline" className="mt-2">
                                                            {cls.levelRequired}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <Link href={`/clases/${cls.id}/checkin`} className="w-full block">
                                                    <Button variant="secondary" className="w-full gap-2">
                                                        <QrCode className="h-4 w-4" />
                                                        Iniciar Check-in
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
}
