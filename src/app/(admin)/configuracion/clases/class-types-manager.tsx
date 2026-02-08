"use client";

import { useState } from "react";
import { useClassTypes, ClassType } from "@/hooks/use-class-types";
import { createClassType, updateClassType, deleteClassType } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Icon picker is complex, for now simple input or select from lucide subset?
// Simplified: Just use a set of predefined icons or text input for now.

const PRESET_ICONS = ["Dumbbell", "Sword", "Swords", "Activity", "Baby", "Trophy", "Flame", "Zap", "Heart"];

export function ClassTypesManager() {
    const { types, loading, error } = useClassTypes();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<ClassType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        label: "",
        code: "", // Only for create
        color: "#D4AF37",
        borderColor: "#D4AF37",
        icon: "Dumbbell"
    });

    const handleEditClick = (type: ClassType) => {
        setSelectedType(type);
        setFormData({
            label: type.label,
            code: type.code,
            color: type.color,
            borderColor: type.borderColor,
            icon: type.icon || "Dumbbell"
        });
        setIsEditOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Auto-generate code if empty or sanitize
        const code = formData.code.toUpperCase().replace(/\s+/g, "_");

        const res = await createClassType({
            ...formData,
            code,
            active: true
        });

        setIsSubmitting(false);
        if (res.success) {
            toast.success("Tipo de clase creado");
            setIsCreateOpen(false);
            window.location.reload(); // Simple reload to refresh hook data
        } else {
            toast.error(res.error);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedType) return;
        setIsSubmitting(true);

        const res = await updateClassType(selectedType.id, {
            label: formData.label,
            color: formData.color,
            borderColor: formData.borderColor,
            icon: formData.icon
        });

        setIsSubmitting(false);
        if (res.success) {
            toast.success("Tipo de clase actualizado");
            setIsEditOpen(false);
            window.location.reload();
        } else {
            toast.error(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar este tipo? Las clases existentes podrían perder su estilo personalizado.")) return;

        const res = await deleteClassType(id);
        if (res.success) {
            toast.success("Tipo eliminado");
            window.location.reload();
        } else {
            toast.error(res.error);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-8">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Tipos Disponibles</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Tipo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Tipo de Clase</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Nombre visible</Label>
                                <Input
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="Ej. Yoga"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Código Interno (ID)</Label>
                                <Input
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="Ej. YOGA"
                                    required
                                />
                                <p className="text-xs text-muted-foreground p-0">Se convertirá a mayúsculas y guiones bajos autom.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Color de Fondo</Label>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: formData.color }}></div>
                                        <Input
                                            type="color" // Browser native picker
                                            value={formData.color}
                                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                                            className="w-full h-8 p-1"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Color de Borde</Label>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: formData.borderColor }}></div>
                                        <Input
                                            type="color"
                                            value={formData.borderColor}
                                            onChange={e => setFormData({ ...formData, borderColor: e.target.value })}
                                            className="w-full h-8 p-1"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Crear"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {types.map(type => (
                    <Card key={type.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                        {/* Visual Preview Banner */}
                        <div
                            className="h-2 w-full absolute top-0 left-0"
                            style={{ backgroundColor: type.borderColor }}
                        />

                        <CardContent className="pt-6 pb-4">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3 items-center">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                                        style={{ backgroundColor: type.color }}
                                    >
                                        {/* Simplified Icon handling: default Trophy if fail */}
                                        <div className="font-bold text-xs">{type.code.substring(0, 2)}</div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{type.label}</h3>
                                        <p className="text-xs text-muted-foreground font-mono">{type.code}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(type)}>
                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(type.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <div
                                    className="px-2 py-1 rounded text-xs text-white"
                                    style={{ backgroundColor: type.color }}
                                >
                                    Fondo
                                </div>
                                <div
                                    className="px-2 py-1 rounded border text-xs"
                                    style={{ borderColor: type.borderColor, color: type.borderColor }}
                                >
                                    Borde
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar: {selectedType?.label}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Nombre visible</Label>
                            <Input
                                value={formData.label}
                                onChange={e => setFormData({ ...formData, label: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Color de Fondo</Label>
                                <Input
                                    type="color"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    className="h-10 px-1 w-full"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Color de Borde</Label>
                                <Input
                                    type="color"
                                    value={formData.borderColor}
                                    onChange={e => setFormData({ ...formData, borderColor: e.target.value })}
                                    className="h-10 px-1 w-full"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar Cambios"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
