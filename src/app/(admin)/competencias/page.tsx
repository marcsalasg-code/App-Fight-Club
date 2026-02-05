import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, Users } from "lucide-react";
import { NewCompetitionModal } from "./new-competition-modal";
import { NewEventModal } from "./new-event-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = 'force-dynamic';

async function getCompetitions() {
    return await prisma.competition.findMany({
        orderBy: { date: "desc" },
        include: {
            athlete: { select: { firstName: true, lastName: true } },
        },
    });
}

async function getEvents() {
    return await prisma.competitionEvent.findMany({
        orderBy: { date: "desc" },
        include: {
            _count: { select: { competitions: true } }
        }
    });
}

async function getStats() {
    const [total, wins, competitors] = await Promise.all([
        prisma.competition.count(),
        prisma.competition.count({ where: { result: "WON" } }),
        prisma.athlete.count({ where: { isCompetitor: true } }),
    ]);
    return { total, wins, competitors };
}

const resultColors: Record<string, string> = {
    WON: "bg-green-500/10 text-green-700",
    LOST: "bg-red-500/10 text-red-700",
    DRAW: "bg-yellow-500/10 text-yellow-700",
    PENDING: "bg-gray-500/10 text-gray-700",
};

const resultLabels: Record<string, string> = {
    WON: "Victoria",
    LOST: "Derrota",
    DRAW: "Empate",
    PENDING: "Pendiente",
};

export default async function CompetitionsPage() {
    const [competitions, events, stats] = await Promise.all([
        getCompetitions(),
        getEvents(),
        getStats(),
    ]);

    return (
        <div className="space-y-6">

            <PageHeader
                title="Competencias"
                subtitle="Gestión de veladas y equipo de competición"
            />

            <Tabs defaultValue="events" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="events">Veladas (Eventos)</TabsTrigger>
                    <TabsTrigger value="history">Historial Combates</TabsTrigger>
                    <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                </TabsList>

                {/* EVENTS TAB */}
                <TabsContent value="events" className="space-y-4">
                    <div className="flex justify-end">
                        <NewEventModal />
                    </div>

                    {events.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No hay eventos programados. Crea una nueva velada para empezar.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {events.map(event => (
                                <Card key={event.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={event.status === 'UPCOMING' ? 'default' : 'secondary'}>
                                                {event.status === 'UPCOMING' ? 'Próximo' : event.status}
                                            </Badge>
                                            {event.type && <span className="text-xs text-muted-foreground uppercase">{event.type}</span>}
                                        </div>
                                        <CardTitle className="text-lg leading-tight mt-2">{event.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(event.date).toLocaleDateString("es-ES")}
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.location}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                {event._count.competitions} combates registrados
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t flex justify-end">
                                            <a href={`/competencias/${event.id}`} className="w-full">
                                                <Button variant="outline" size="sm" className="w-full">Ver Detalles</Button>
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="space-y-4">
                    <div className="flex justify-end">
                        <NewCompetitionModal />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Combates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {competitions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        No hay competencias registradas
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {competitions.map((comp) => (
                                        <div
                                            key={comp.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-4"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium">{comp.eventName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {comp.athlete.firstName} {comp.athlete.lastName}
                                                    {comp.category && ` • ${comp.category}`}
                                                    {comp.weight && ` • ${comp.weight}kg`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={resultColors[comp.result]}>
                                                    {resultLabels[comp.result]}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(comp.date).toLocaleDateString("es-ES")}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* STATS TAB */}
                <TabsContent value="stats">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Combates
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Victorias
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.total > 0
                                        ? `${((stats.wins / stats.total) * 100).toFixed(0)}% ratio`
                                        : "-"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Atletas Competidores
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.competitors}</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
