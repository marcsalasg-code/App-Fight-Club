"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Users, Plus, Trash2, PenSquare, Mail, Calendar, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createCoach, updateCoach, deleteCoach, CoachFormData } from "./actions";

type Coach = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string | Date;
    _count: { classes: number };
};

type Props = {
    initialCoaches: Coach[];
};

export function CoachesClient({ initialCoaches }: Props) {
    const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
    const [formData, setFormData] = useState<CoachFormData>({
        name: "",
        email: "",
        password: "",
        role: "COACH",
    });

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "", role: "COACH" });
        setEditingCoach(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCoach) {
            const result = await updateCoach(editingCoach.id, formData);
            if (result.success) {
                toast.success("Entrenador actualizado");
                setCoaches(prev =>
                    prev.map(c =>
                        c.id === editingCoach.id
                            ? { ...c, name: formData.name, email: formData.email, role: formData.role || "COACH" }
                            : c
                    )
                );
            } else {
                toast.error(result.error);
            }
        } else {
            const result = await createCoach(formData);
            if (result.success && result.data) {
                toast.success("Entrenador creado");
                setCoaches(prev => [
                    ...prev,
                    {
                        id: result.data!.id,
                        name: result.data!.name,
                        email: result.data!.email,
                        role: formData.role || "COACH",
                        createdAt: new Date(),
                        _count: { classes: 0 },
                    },
                ]);
            } else {
                toast.error(result.error);
            }
        }

        setDialogOpen(false);
        resetForm();
    };

    const handleEdit = (coach: Coach) => {
        setEditingCoach(coach);
        setFormData({
            name: coach.name,
            email: coach.email,
            password: "",
            role: coach.role,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        const result = await deleteCoach(id);
        if (result.success) {
            toast.success("Entrenador eliminado");
            setCoaches(prev => prev.filter(c => c.id !== id));
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Entrenadores</h1>
                        <p className="text-muted-foreground">
                            Gestiona el equipo de entrenadores
                        </p>
                    </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Entrenador
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCoach ? "Editar Entrenador" : "Nuevo Entrenador"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {editingCoach ? "Nueva Contraseña (dejar vacío para mantener)" : "Contraseña"}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    required={!editingCoach}
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="COACH">Entrenador</SelectItem>
                                        <SelectItem value="ADMIN">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingCoach ? "Guardar" : "Crear"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coaches.map((coach) => (
                    <Card key={coach.id} className="relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{coach.name}</CardTitle>
                                    <Badge variant={coach.role === "ADMIN" ? "default" : "secondary"} className="mt-1">
                                        {coach.role === "ADMIN" ? "Administrador" : "Entrenador"}
                                    </Badge>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(coach)}
                                    >
                                        <PenSquare className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar entrenador?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Si el entrenador tiene clases asignadas, será desactivado en lugar de eliminado.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(coach.id)}>
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{coach.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Dumbbell className="h-4 w-4" />
                                <span>{coach._count.classes} clases asignadas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Desde {new Date(coach.createdAt).toLocaleDateString("es-ES")}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {coaches.length === 0 && (
                    <Card className="col-span-full">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mb-4 opacity-50" />
                            <p>No hay entrenadores registrados</p>
                            <p className="text-sm">Haz clic en &quot;Nuevo Entrenador&quot; para agregar uno</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
