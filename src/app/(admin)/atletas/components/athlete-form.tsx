"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createAthlete, updateAthlete, AthleteFormData } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Athlete = {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    pin: string | null;
    dateOfBirth: Date | null;
    emergencyContact: string | null;
    medicalConditions: string | null;
    height: number | null;
    weight: number | null;
    level: string;
    goal: string;
    isCompetitor: boolean;
    competitionCategory: string | null;
};

type Props = {
    athlete?: Athlete;
};

export function AthleteForm({ athlete }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isCompetitor, setIsCompetitor] = useState(athlete?.isCompetitor || false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        const data: AthleteFormData = {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            pin: formData.get("pin") as string,
            dateOfBirth: formData.get("dateOfBirth") as string,
            emergencyContact: formData.get("emergencyContact") as string,
            medicalConditions: formData.get("medicalConditions") as string,
            height: formData.get("height") ? parseFloat(formData.get("height") as string) : undefined,
            weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined,
            level: formData.get("level") as string,
            goal: formData.get("goal") as string,
            isCompetitor: formData.get("isCompetitor") === "on",
            competitionCategory: formData.get("competitionCategory") as string,
        };

        const result = athlete
            ? await updateAthlete(athlete.id, data)
            : await createAthlete(data);

        setLoading(false);

        if (result.success) {
            toast.success(athlete ? "Atleta actualizado" : "Atleta creado");
            router.push("/atletas");
        } else {
            toast.error(result.error);
        }
    }

    return (
        <form action={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Personal Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    required
                                    defaultValue={athlete?.firstName}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    required
                                    defaultValue={athlete?.lastName}
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={athlete?.email || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={athlete?.phone || ""}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pin">PIN de Acceso (4 dígitos) *</Label>
                            <Input
                                id="pin"
                                name="pin"
                                minLength={4}
                                maxLength={4}
                                required
                                placeholder="Ej: 1234"
                                defaultValue={athlete?.pin || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                defaultValue={
                                    athlete?.dateOfBirth
                                        ? new Date(athlete.dateOfBirth).toISOString().split("T")[0]
                                        : ""
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                            <Input
                                id="emergencyContact"
                                name="emergencyContact"
                                defaultValue={athlete?.emergencyContact || ""}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Training Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de Entrenamiento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="level">Nivel</Label>
                                <Select name="level" defaultValue={athlete?.level || "BEGINNER"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar nivel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BEGINNER">Principiante</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                                        <SelectItem value="ADVANCED">Avanzado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="goal">Objetivo</Label>
                                <Select name="goal" defaultValue={athlete?.goal || "RECREATIONAL"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar objetivo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RECREATIONAL">Recreativo</SelectItem>
                                        <SelectItem value="FITNESS">Fitness</SelectItem>
                                        <SelectItem value="COMPETITION">Competencia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isCompetitor"
                                name="isCompetitor"
                                className="h-4 w-4 rounded border-input"
                                defaultChecked={athlete?.isCompetitor}
                                onChange={(e) => setIsCompetitor(e.target.checked)}
                            />
                            <Label htmlFor="isCompetitor" className="font-normal">
                                Es atleta de competencia
                            </Label>
                        </div>

                        {isCompetitor && (
                            <div className="space-y-2">
                                <Label htmlFor="competitionCategory">Categoría de Competencia</Label>
                                <Input
                                    id="competitionCategory"
                                    name="competitionCategory"
                                    placeholder="Ej: -70kg Amateur"
                                    defaultValue={athlete?.competitionCategory || ""}
                                />
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="height">Altura (cm)</Label>
                                <Input
                                    id="height"
                                    name="height"
                                    type="number"
                                    step="0.1"
                                    defaultValue={athlete?.height || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Peso (kg)</Label>
                                <Input
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    step="0.1"
                                    defaultValue={athlete?.weight || ""}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="medicalConditions">Condiciones Médicas / Alergias</Label>
                            <Input
                                id="medicalConditions"
                                name="medicalConditions"
                                placeholder="Indicar condiciones relevantes..."
                                defaultValue={athlete?.medicalConditions || ""}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {athlete ? "Guardar Cambios" : "Crear Atleta"}
                </Button>
            </div>
        </form>
    );
}
