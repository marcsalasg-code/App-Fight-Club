import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar } from "lucide-react";
import { NewCompetitionModal } from "./new-competition-modal";

export const dynamic = 'force-dynamic';

async function getCompetitions() {
    return prisma.competition.findMany({
        orderBy: { date: "desc" },
        include: {
            athlete: { select: { firstName: true, lastName: true } },
        },
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
    const [competitions, stats] = await Promise.all([
        getCompetitions(),
        getStats(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        Competencias
                    </h1>
                    <p className="text-muted-foreground">
                        Historial de competencias de atletas
                    </p>
                </div>
                <NewCompetitionModal />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Competencias
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

            {/* Competitions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial</CardTitle>
                </CardHeader>
                <CardContent>
                    {competitions.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
        </div>
    );
}
