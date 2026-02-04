import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Edit,
    Trophy,
    Phone,
    Mail,
    Calendar,
    User,
    Activity,
    AlertCircle,
    Receipt,
    CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceTab } from "./components/attendance-tab";

export const dynamic = 'force-dynamic';

async function getAthlete(id: string) {
    return prisma.athlete.findUnique({
        where: { id },
        include: {
            subscriptions: {
                include: { membership: true },
                orderBy: { createdAt: "desc" },
            },
            payments: {
                orderBy: { paymentDate: "desc" },
                take: 50, // Increase slightly
            },
            attendances: {
                orderBy: { date: "desc" },
                // Fetched all for analysis
                include: { class: true },
            },
            competitions: {
                orderBy: { date: "desc" },
            },
        },
    });
}

const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-700",
    INACTIVE: "bg-gray-500/10 text-gray-700",
    SUSPENDED: "bg-red-500/10 text-red-700",
};

const statusLabels: Record<string, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    SUSPENDED: "Suspendido",
};

const levelLabels: Record<string, string> = {
    BEGINNER: "Principiante",
    INTERMEDIATE: "Intermedio",
    ADVANCED: "Avanzado",
};

const goalLabels: Record<string, string> = {
    RECREATIONAL: "Recreativo",
    FITNESS: "Fitness",
    COMPETITION: "Competencia",
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function AthleteDetailPage({ params }: Props) {
    const { id } = await params;
    const athlete = await getAthlete(id);

    if (!athlete) {
        notFound();
    }

    const activeSubscription = athlete.subscriptions.find(
        (s) => s.status === "ACTIVE"
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/atletas"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                            {athlete.firstName[0]}
                            {athlete.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {athlete.firstName} {athlete.lastName}
                                {athlete.isCompetitor && (
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                )}
                            </h1>
                            <div className="flex items-center gap-2">
                                <Badge className={statusColors[athlete.status]}>
                                    {statusLabels[athlete.status]}
                                </Badge>
                                <Badge variant="outline">{levelLabels[athlete.level]}</Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <Link href={`/atletas/${id}/editar`}>
                    <Button variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Editar
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 mt-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Info Columns */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Información Personal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    {athlete.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{athlete.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {athlete.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Teléfono</p>
                                                <p className="font-medium">{athlete.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {athlete.dateOfBirth && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Fecha de Nacimiento
                                                </p>
                                                <p className="font-medium">
                                                    {new Date(athlete.dateOfBirth).toLocaleDateString("es-ES")}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {athlete.emergencyContact && (
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Contacto Emergencia
                                                </p>
                                                <p className="font-medium">{athlete.emergencyContact}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Training Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Información de Entrenamiento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Objetivo</p>
                                            <p className="font-medium">{goalLabels[athlete.goal]}</p>
                                        </div>
                                        {athlete.height && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Altura</p>
                                                <p className="font-medium">{athlete.height} cm</p>
                                            </div>
                                        )}
                                        {athlete.weight && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Peso</p>
                                                <p className="font-medium">{athlete.weight} kg</p>
                                            </div>
                                        )}
                                        {athlete.isCompetitor && athlete.competitionCategory && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Categoría Competencia
                                                </p>
                                                <p className="font-medium">{athlete.competitionCategory}</p>
                                            </div>
                                        )}
                                    </div>
                                    {athlete.medicalConditions && (
                                        <>
                                            <Separator className="my-4" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Condiciones Médicas
                                                </p>
                                                <p className="font-medium">{athlete.medicalConditions}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Activity Mini-List (Just top 5) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Últimas Asistencias</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {athlete.attendances.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">Sin actividad reciente</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {athlete.attendances.slice(0, 5).map((att) => (
                                                <div key={att.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{att.class.name}</p>
                                                            <p className="text-xs text-muted-foreground">{att.class.type}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(att.date).toLocaleDateString("es-ES")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            {/* Subscription */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Suscripción</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {activeSubscription ? (
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-200">
                                                <p className="font-medium text-green-700">
                                                    {activeSubscription.membership.name}
                                                </p>
                                                <p className="text-sm text-green-600">
                                                    Hasta:{" "}
                                                    {activeSubscription.endDate
                                                        ? new Date(activeSubscription.endDate).toLocaleDateString(
                                                            "es-ES"
                                                        )
                                                        : "Sin fecha de fin"}
                                                </p>
                                            </div>
                                            <Link href={`/pagos/nuevo?athleteId=${athlete.id}`}>
                                                <Button variant="outline" className="w-full">
                                                    Renovar Suscripción
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-200">
                                                <p className="font-medium text-yellow-700">Sin suscripción activa</p>
                                            </div>
                                            <Link href={`/pagos/nuevo?athleteId=${athlete.id}`}>
                                                <Button className="w-full">Registrar Suscripción</Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Payments Small */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Receipt className="h-4 w-4" /> Pagos Recientes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {athlete.payments.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">Sin pagos registrados</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {athlete.payments.slice(0, 3).map((payment) => (
                                                <div key={payment.id} className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <p className="font-medium">€{payment.amount.toFixed(2)}</p>
                                                        <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
                                                    </div>
                                                    <span className="text-muted-foreground text-xs">
                                                        {new Date(payment.paymentDate).toLocaleDateString("es-ES")}
                                                    </span>
                                                </div>
                                            ))}
                                            <Button variant="ghost" size="sm" className="w-full text-xs h-7">Ver todos</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Competitions */}
                            {athlete.isCompetitor && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Trophy className="h-4 w-4 text-yellow-500" />
                                            Competencias
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {athlete.competitions.length === 0 ? (
                                            <p className="text-muted-foreground text-sm">Sin registros</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {athlete.competitions.map((comp) => (
                                                    <div
                                                        key={comp.id}
                                                        className="p-2 rounded-lg bg-muted/50 text-sm"
                                                    >
                                                        <p className="font-medium">{comp.eventName}</p>
                                                        <div className="flex justify-between text-xs mt-1">
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    comp.result === "WON"
                                                                        ? "text-green-600 border-green-200"
                                                                        : comp.result === "LOST"
                                                                            ? "text-red-600 border-red-200"
                                                                            : ""
                                                                }
                                                            >
                                                                {comp.result}
                                                            </Badge>
                                                            <span className="text-muted-foreground">
                                                                {new Date(comp.date).toLocaleDateString("es-ES")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="attendance">
                    <AttendanceTab attendances={athlete.attendances} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
