import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
import { AthletesTable } from "./components/athletes-table";
import { AthleteColumn } from "./components/columns";
import { AthleteCard } from "@/components/athlete-card";

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

    return prisma.athlete.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            subscriptions: {
                where: { status: "ACTIVE" },
                take: 1,
                orderBy: { endDate: "desc" },

            },
            tags: true,
            _count: { select: { attendances: true } },
        },
    });
}

type Props = {
    searchParams: Promise<{ search?: string }>;
};

export default async function AthletesPage({ searchParams }: Props) {
    const params = await searchParams;
    const athletes = await getAthletes(params.search);

    const formattedAthletes: AthleteColumn[] = athletes.map(a => ({
        id: a.id,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        status: a.status,
        level: a.level,
        isCompetitor: a.isCompetitor,

        hasActiveSubscription: a.subscriptions.length > 0,
        tags: a.tags.map(t => ({ label: t.label, color: t.color }))
    }));

    // Transform for mobile cards
    const athleteCards = athletes.map(a => ({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`,
        email: a.email,
        phone: a.phone,
        status: a.status,
        isCompetitor: a.isCompetitor,
        _count: a._count,
        tags: a.tags.map(t => ({ id: t.id, name: t.label, color: t.color })),
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Atletas</h1>
                    <p className="text-muted-foreground">
                        Gestiona los miembros del gimnasio
                    </p>
                </div>
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
            </div>

            {/* Desktop Table */}
            <Card className="hidden md:block">
                <CardHeader>
                    <CardTitle>
                        {athletes.length} {athletes.length === 1 ? "atleta" : "atletas"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <AthletesTable data={formattedAthletes} />
                </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                <p className="text-sm text-muted-foreground">
                    {athletes.length} {athletes.length === 1 ? "atleta" : "atletas"}
                </p>
                {athleteCards.map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
                {athleteCards.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No hay atletas registrados
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

