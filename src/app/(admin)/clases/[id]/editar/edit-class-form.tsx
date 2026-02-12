"use client";

import { useState, useEffect } from "react";
import { useClassTypes } from "@/hooks/use-class-types";
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
import { updateClass, ClassFormData } from "../../actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { getCoachesForSelect } from "@/app/(admin)/configuracion/entrenadores/actions";
import { deleteClass } from "../../actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ClassData = {
    id: string;
    name: string;
    type: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    levelRequired: string | null;
    maxCapacity: number;
    color: string;
    coaches: { id: string; name: string }[];
};

export function EditClassForm({ classData }: { classData: ClassData }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { types: classTypes } = useClassTypes();
    const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([]);

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
            coachIds,
            levelRequired: formData.get("levelRequired") as string,
            maxCapacity: parseInt(formData.get("maxCapacity") as string),
            color: formData.get("color") as string,
        };

        const result = await updateClass(classData.id, data);
        setLoading(false);

        if (result.success) {
            toast.success("Clase actualizada");
            router.push("/clases");
        } else {
            toast.error(result.error);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        const result = await deleteClass(classData.id);
        setDeleting(false);

        if (result.success) {
            toast.success("Clase eliminada");
            router.push("/clases");
        } else {
            toast.error(result.error);
        }
    }

    const coach1Default = classData.coaches[0]?.id || "";
    const coach2Default = classData.coaches[1]?.id || "";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/clases"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Editar Clase</h1>
                        <p className="text-muted-foreground">{classData.name}</p>
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Se eliminará la clase &quot;{classData.name}&quot; y todos sus registros de asistencia.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Información de la Clase</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input id="name" name="name" required defaultValue={classData.name} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Entrenador Principal</Label>
                                <Select name="coach1" defaultValue={coach1Default}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {coaches.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Entrenador Asistente</Label>
                                <Select name="coach2" defaultValue={coach2Default}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {coaches.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Tipo *</Label>
                                <Select name="type" required defaultValue={classData.type}>
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
                                <Label>Día *</Label>
                                <Select name="dayOfWeek" required defaultValue={classData.dayOfWeek}>
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
                                <Input id="startTime" name="startTime" type="time" required defaultValue={classData.startTime} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Hora fin *</Label>
                                <Input id="endTime" name="endTime" type="time" required defaultValue={classData.endTime} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nivel requerido</Label>
                                <Select name="levelRequired" defaultValue={classData.levelRequired || undefined}>
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
                                <Input id="maxCapacity" name="maxCapacity" type="number" required defaultValue={classData.maxCapacity} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Color en Calendario</Label>
                            <div className="flex gap-4">
                                {["#D4AF37", "#E11d48", "#2563eb", "#16a34a", "#4b5563"].map((c) => (
                                    <div key={c} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id={`color-${c}`}
                                            name="color"
                                            value={c}
                                            defaultChecked={c === classData.color}
                                            className="accent-primary"
                                        />
                                        <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
