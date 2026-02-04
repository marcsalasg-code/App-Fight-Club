
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Trophy, ArrowLeft, Users, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewCompetitionModal } from "../new-competition-modal";
import { EditEventModal } from "../edit-event-modal";
import { EditResultButton } from "../edit-result-button";

export const dynamic = 'force-dynamic';

interface Props {
    params: {
        id: string;
    }
}

async function getEvent(id: string) {
    return prisma.competitionEvent.findUnique({
        where: { id },
        include: {
            competitions: {
                orderBy: { createdAt: "asc" }, // Or by order usage
                include: {
                    athlete: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            }
        }
    });
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

export default async function EventDetailPage({ params }: Props) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    const { competitions } = event;
    const stats = {
        total: competitions.length,
        wins: competitions.filter(c => c.result === "WON").length,
        pending: competitions.filter(c => c.result === "PENDING").length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/competencias" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Volver a Competencias
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{event.name}</h1>
                            <Badge variant={event.status === 'UPCOMING' ? 'default' : 'secondary'}>
                                {event.status === 'UPCOMING' ? 'Próximo' : event.status}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.date).toLocaleDateString("es-ES", { dateStyle: 'long' })}
                            </div>
                            {event.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {event.location}
                                </div>
                            )}
                            {event.type && (
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="h-4 w-4" />
                                    <span className="uppercase">{event.type}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <EditEventModal event={event} />
                        <NewCompetitionModal eventId={event.id} />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-muted/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold">{stats.total}</span>
                        <span className="text-xs text-muted-foreground uppercase font-medium">Combates</span>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-green-700">{stats.wins}</span>
                        <span className="text-xs text-green-600/80 uppercase font-medium">Victorias</span>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-500/5">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-yellow-700">{stats.pending}</span>
                        <span className="text-xs text-yellow-600/80 uppercase font-medium">Pendientes</span>
                    </CardContent>
                </Card>
            </div>

            {/* Fight Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Cartelera (Fight Card)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {competitions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No hay combates registrados para este evento.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {competitions.map((comp, index) => (
                                <div
                                    key={comp.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {index + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-semibold flex items-center gap-2">
                                                {comp.athlete.firstName} {comp.athlete.lastName}
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {comp.category || "Sin categoría"}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-3">
                                                {comp.weight && (
                                                    <span className="flex items-center gap-1">
                                                        ⚖️ {comp.weight}kg
                                                    </span>
                                                )}
                                                {comp.notes && <span>📝 {comp.notes}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                        <Badge className={resultColors[comp.result]}>
                                            {resultLabels[comp.result]}
                                        </Badge>
                                        <EditResultButton
                                            competitionId={comp.id}
                                            currentResult={comp.result}
                                            athleteId={comp.athleteId}
                                            eventName={event.name}
                                            date={event.date}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
