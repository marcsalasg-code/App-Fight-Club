"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    User, Mail, Phone, Calendar, AlertCircle,
    Activity, Ruler, Weight, Medal, HeartPulse
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Athlete = {
    email: string | null;
    phone: string | null;
    dateOfBirth: Date | null;
    emergencyContact: string | null;
    goal: string;
    height: number | null;
    weight: number | null;
    medicalConditions: string | null;
    isCompetitor: boolean;
    competitionCategory: string | null;
    level: string;
};

const goalLabels: Record<string, string> = {
    RECREATIONAL: "Recreativo",
    FITNESS: "Fitness",
    COMPETITION: "Competencia",
};

export function AthleteProfileCard({ athlete }: { athlete: Athlete }) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Perfil del Atleta
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Personal Info Section */}
                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        Datos Personales
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {athlete.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="text-sm font-medium truncate" title={athlete.email}>{athlete.email}</p>
                                </div>
                            </div>
                        )}
                        {athlete.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Teléfono</p>
                                    <p className="text-sm font-medium">{athlete.phone}</p>
                                </div>
                            </div>
                        )}
                        {athlete.dateOfBirth && (
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Fecha Nacimiento</p>
                                    <p className="text-sm font-medium">
                                        {new Date(athlete.dateOfBirth).toLocaleDateString("es-ES")}
                                    </p>
                                </div>
                            </div>
                        )}
                        {athlete.emergencyContact && (
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Emergencia</p>
                                    <p className="text-sm font-medium truncate">{athlete.emergencyContact}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Physical & Training Info Section */}
                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Físico y Entrenamiento
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Objetivo</p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{goalLabels[athlete.goal] || athlete.goal}</p>
                            </div>
                        </div>

                        {(athlete.height || athlete.weight) && (
                            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                                {athlete.height && (
                                    <div className="flex items-center gap-2">
                                        <Ruler className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Altura</p>
                                            <p className="text-sm font-medium">{athlete.height} cm</p>
                                        </div>
                                    </div>
                                )}
                                {athlete.weight && (
                                    <div className="flex items-center gap-2">
                                        <Weight className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Peso</p>
                                            <p className="text-sm font-medium">{athlete.weight} kg</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {athlete.isCompetitor && athlete.competitionCategory && (
                            <div className="sm:col-span-3 pt-2">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-2 flex items-center gap-3">
                                    <Medal className="h-4 w-4 text-amber-600" />
                                    <div>
                                        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">Categoría Competencia</p>
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">{athlete.competitionCategory}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {athlete.medicalConditions && (
                        <div className="mt-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-md p-3">
                            <div className="flex items-start gap-2">
                                <HeartPulse className="h-4 w-4 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-0.5">Condiciones Médicas</p>
                                    <p className="text-sm text-red-800 dark:text-red-200 leading-snug">{athlete.medicalConditions}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
