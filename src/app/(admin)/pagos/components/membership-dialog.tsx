"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createMembership, updateMembership, MembershipFormData } from "../actions";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";

type Props = {
    membership?: {
        id: string;
        name: string;
        price: number;
        durationDays: number | null;
        classCount: number | null;
        weeklyLimit: number | null;
        description: string | null;
    };
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function MembershipDialog({ membership, trigger, open: controlledOpen, onOpenChange }: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasWeeklyLimit, setHasWeeklyLimit] = useState(!!membership?.weeklyLimit);

    // Reset state when opening dialg if creating new, or sync with membership if editing
    // Simplify usage of uncontrolled vs controlled
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;

    const isEditing = !!membership;

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        const data: MembershipFormData = {
            name: formData.get("name") as string,
            price: parseFloat(formData.get("price") as string),
            durationDays: formData.get("durationDays")
                ? parseInt(formData.get("durationDays") as string)
                : undefined,
            classCount: formData.get("classCount")
                ? parseInt(formData.get("classCount") as string)
                : undefined,
            weeklyLimit: hasWeeklyLimit && formData.get("weeklyLimit")
                ? parseInt(formData.get("weeklyLimit") as string)
                : undefined,
            description: formData.get("description") as string,
        };

        let result;
        if (isEditing && membership) {
            result = await updateMembership(membership.id, data);
        } else {
            result = await createMembership(data);
        }

        setLoading(false);

        if (result.success) {
            toast.success(isEditing ? "Membresía actualizada" : "Membresía creada");
            if (setOpen) setOpen(false);
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (setOpen) setOpen(val);
            if (val) {
                setHasWeeklyLimit(!!membership?.weeklyLimit);
            }
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2" variant={isEditing ? "outline" : "default"}>
                        {isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {isEditing ? "Editar Membresía" : "Nueva Membresía"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Membresía" : "Nueva Membresía"}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-6">

                    {/* Main Info */}
                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre de la Tarifa *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Ej: Mensual 2 Días"
                                    defaultValue={membership?.name}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio (€) *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="50.00"
                                    defaultValue={membership?.price}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Frecuencia Semanal</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={!hasWeeklyLimit ? "default" : "outline"}
                                    onClick={() => setHasWeeklyLimit(false)}
                                    className="w-full"
                                >
                                    Ilimitado
                                </Button>
                                <Button
                                    type="button"
                                    variant={hasWeeklyLimit ? "default" : "outline"}
                                    onClick={() => setHasWeeklyLimit(true)}
                                    className="w-full"
                                >
                                    Límite Semanal
                                </Button>
                            </div>
                            {hasWeeklyLimit && (
                                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="weeklyLimit" className="text-xs text-muted-foreground">Clases por semana</Label>
                                    <Input
                                        id="weeklyLimit"
                                        name="weeklyLimit"
                                        type="number"
                                        placeholder="Ej: 2"
                                        defaultValue={membership?.weeklyLimit || 2}
                                        min={1}
                                        max={7}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <p className="text-sm font-medium">Límites de Duración</p>
                        <div className="grid gap-4 grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="durationDays" className="text-xs text-muted-foreground">Días de validez</Label>
                                <Input
                                    id="durationDays"
                                    name="durationDays"
                                    type="number"
                                    placeholder="Ej: 30"
                                    defaultValue={membership?.durationDays || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="classCount" className="text-xs text-muted-foreground">Bono de clases (Total)</Label>
                                <Input
                                    id="classCount"
                                    name="classCount"
                                    type="number"
                                    placeholder="Ej: 10"
                                    defaultValue={membership?.classCount || ""}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            * Rellenar solo uno. Dejar ambos vacíos para acceso ilimitado perpetuo.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs text-muted-foreground">Notas internas (Opcional)</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Descripción visible solo para admin..."
                            defaultValue={membership?.description || ""}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen && setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Guardar Cambios" : "Crear Tarifa"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
