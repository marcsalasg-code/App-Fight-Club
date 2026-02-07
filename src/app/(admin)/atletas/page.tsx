import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
import { AthletesTable } from "./components/athletes-table";
import { AthleteColumn } from "./components/columns";
import { AthleteCard } from "@/components/athletes/athlete-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { User } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getAthletes(search?: string) {
    const where = search
        ? {
            OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ],
        }
        : {};

    // Calculate week boundaries for attendance counting
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const athletesData = await prisma.athlete.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            subscriptions: {
                where: { status: "ACTIVE" },
                take: 1,
                orderBy: { endDate: "desc" },
                include: { membership: true }
            },
            tags: true,
            attendances: {
                where: {
                    date: { gte: weekStart, lte: weekEnd }
                },
                select: { id: true } // Only need count
            },
            _count: { select: { attendances: true } },
        },
    });

    return athletesData;
}

type Props = {
    searchParams: Promise<{ search?: string }>;
};

export default async function AthletesPage({ searchParams }: Props) {
    const params = await searchParams;
    const athletes = await getAthletes(params.search);

    const formattedAthletes: AthleteColumn[] = athletes.map(a => {
        // Calculate Status Color
        let statusColor: "green" | "yellow" | "red" = "red";
        let statusLabel = "Sin membresía";
        const subscription = a.subscriptions[0];

        if (subscription) {
            if (subscription.endDate) {
                const endDate = new Date(subscription.endDate);
                const daysSinceExpiry = Math.floor((new Date().getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysSinceExpiry < 0) {
                    statusColor = "green";
                    statusLabel = "Activo";
                } else if (daysSinceExpiry <= 5) {
                    statusColor = "yellow";
                    statusLabel = "Prórroga";
                } else {
                    statusColor = "red";
                    statusLabel = "Vencido";
                }
            } else {
                statusColor = "green";
                statusLabel = "Activo";
            }
        }

        // Calculate Session Badge
        let sessionsBadge: string | null = null;
        let isOverLimit = false;

        if (subscription?.membership?.weeklyLimit) {
            const used = a.attendances.length;
            const limit = subscription.membership.weeklyLimit;
            sessionsBadge = `${used}/${limit}`;
            isOverLimit = used >= limit;
        }

        return {
            id: a.id,
            firstName: a.firstName,
            lastName: a.lastName,
            email: a.email,
            phone: a.phone,
            status: a.status,
            level: a.level,
            isCompetitor: a.isCompetitor,

            hasActiveSubscription: a.subscriptions.length > 0,
            tags: a.tags.map(t => ({ label: t.label, color: t.color })),

            // Rich indicators
            membershipColor: statusColor,
            membershipLabel: statusLabel,
            sessionsBadge,
            isOverLimit
        };
    });

    // Transform for mobile cards
    const athleteCards = athletes.map((a, i) => ({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`,
        email: a.email,
        phone: a.phone,
        status: formattedAthletes[i].membershipLabel, // Use calculated label
        statusColor: formattedAthletes[i].membershipColor, // Use calculated color
        sessionsBadge: formattedAthletes[i].sessionsBadge,
        isOverLimit: formattedAthletes[i].isOverLimit,
        isCompetitor: a.isCompetitor,
        _count: a._count,
        tags: a.tags.map(t => ({ id: t.id, name: t.label, color: t.color })),
    }));

    return (
        <div className="space-y-6">

            <PageHeader
                title="Atletas"
                subtitle="Gestiona los miembros del gimnasio"
                action={
                    <div className="flex gap-2">
                        <ExportButton
                            data={athletes}
                            columns={[
                                { header: "Nombre", key: "firstName" },
                                { header: "Apellido", key: "lastName" },
                                { header: "Email", key: "email" },
                                { header: "Teléfono", key: "phone" },
                                { header: "Estado", key: "status" },
                                { header: "Es Competidor", key: "isCompetitor" },
                            ]}
                            fileName="reporte_atletas"
                            title="Listado de Atletas"
                        />
                        <Link href="/atletas/nuevo">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Nuevo Atleta</span>
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* Desktop Table with Tabs */}
            {athletes.length === 0 && !params.search ? (
                <div className="hidden md:block">
                    <EmptyState
                        icon={User}
                        title="No hay atletas registrados"
                        description="Comienza añadiendo los miembros de tu gimnasio."
                        actionLabel="Nuevo Atleta"
                        actionHref="/atletas/nuevo"
                    />
                </div>
            ) : (
                <Card className="hidden md:block border-none shadow-none bg-transparent">
                    <Tabs defaultValue="all" className="w-full space-y-4">
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="all">Todos ({formattedAthletes.length})</TabsTrigger>
                                <TabsTrigger value="team" className="gap-2">
                                    <span className="font-semibold text-primary">Fight Team</span>
                                    <Badge variant="secondary" className="px-1 py-0 h-5 min-w-5 justify-center">
                                        {formattedAthletes.filter(a => a.isCompetitor).length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="mt-0">
                            <Card>
                                <CardContent className="p-0 sm:p-6">
                                    <AthletesTable data={formattedAthletes} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="team" className="mt-0">
                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                        Equipo de Competición
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 sm:p-6">
                                    <AthletesTable data={formattedAthletes.filter(a => a.isCompetitor)} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </Card>
            )}

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                <p className="text-sm text-muted-foreground">
                    {athletes.length} {athletes.length === 1 ? "atleta" : "atletas"}
                </p>
                {athleteCards.map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
                {athleteCards.length === 0 && (
                    <EmptyState
                        icon={User}
                        title="No hay atletas registrados"
                        description="Comienza añadiendo los miembros de tu gimnasio."
                        actionLabel="Nuevo Atleta"
                        actionHref="/atletas/nuevo"
                    />
                )}
            </div>
        </div>
    );
}

