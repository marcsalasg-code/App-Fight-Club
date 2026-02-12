"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { createClass, ClassFormData } from "../actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCoachesForSelect } from "@/app/(admin)/configuracion/entrenadores/actions";
import { useClassTypes } from "@/hooks/use-class-types";

export default function NewClassPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [coaches, setCoaches] = useState<{ id: string, name: string }[]>([]);
    const { types: classTypes } = useClassTypes();

    useEffect(() => {
        getCoachesForSelect().then(setCoaches);
    }, []);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        const coach1 = formData.get("coach1") as string;
        const coach2 = formData.get("coach2") as string;
        const coachIds = [coach1, coach2].filter(Boolean);

        const data: ClassFormData = {
            name: formData.get("name") as string,
            type: formData.get("type") as string,
            dayOfWeek: formData.get("dayOfWeek") as string,
            startTime: formData.get("startTime") as string,
            endTime: formData.get("endTime") as string,
            coachIds: coachIds,
            levelRequired: formData.get("levelRequired") as string,
            maxCapacity: parseInt(formData.get("maxCapacity") as string),
            color: formData.get("color") as string,
        };

        const result = await createClass(data);
        setLoading(false);

        if (result.success) {
            toast.success("Clase creada");
            router.push("/clases");
        } else {
            toast.error(result.error);
        }
    }

    return (
        <div className="space-y-6">
            {/* ... header ... */}
            <div className="flex items-center gap-4">
                <Link
                    href="/clases"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Nueva Clase</h1>
                    <p className="text-muted-foreground">
                        Configura una nueva clase en el horario
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Información de la Clase</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                placeholder="Ej: Muay Thai Principiantes"
                            />
                        </div>

                        {/* Coaches Selection */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="coach1">Entrenador Principal</Label>
                                <Select name="coach1">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {coaches.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="coach2">Entrenador Asistente (Opcional)</Label>
                                <Select name="coach2">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {coaches.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo *</Label>
                                <Select name="type" required defaultValue={classTypes[0]?.code}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classTypes.map(t => (
                                            <SelectItem key={t.code} value={t.code}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dayOfWeek">Día *</Label>
                                <Select name="dayOfWeek" required defaultValue="MONDAY">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar día" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONDAY">Lunes</SelectItem>
                                        <SelectItem value="TUESDAY">Martes</SelectItem>
                                        <SelectItem value="WEDNESDAY">Miércoles</SelectItem>
                                        <SelectItem value="THURSDAY">Jueves</SelectItem>
                                        <SelectItem value="FRIDAY">Viernes</SelectItem>
                                        <SelectItem value="SATURDAY">Sábado</SelectItem>
                                        <SelectItem value="SUNDAY">Domingo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Hora inicio *</Label>
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    required
                                    defaultValue="18:00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Hora fin *</Label>
                                <Input
                                    id="endTime"
                                    name="endTime"
                                    type="time"
                                    required
                                    defaultValue="19:30"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="levelRequired">Nivel requerido</Label>
                                <Select name="levelRequired">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Cualquier nivel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BEGINNER">Principiante</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                                        <SelectItem value="ADVANCED">Avanzado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxCapacity">Capacidad máxima *</Label>
                                <Input
                                    id="maxCapacity"
                                    name="maxCapacity"
                                    type="number"
                                    required
                                    defaultValue="20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color en Calendario</Label>
                            <div className="flex gap-4">
                                {["#D4AF37", "#E11d48", "#2563eb", "#16a34a", "#4b5563"].map((c) => (
                                    <div key={c} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id={`color-${c}`}
                                            name="color"
                                            value={c}
                                            defaultChecked={c === "#D4AF37"}
                                            className="accent-primary"
                                        />
                                        <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Clase
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
