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
        description: string | null;
    };
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function MembershipDialog({ membership, trigger, open: controlledOpen, onOpenChange }: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2" variant={isEditing ? "outline" : "default"}>
                        {isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {isEditing ? "Editar Membresía" : "Nueva Membresía"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Membresía" : "Nueva Membresía"}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            placeholder="Ej: Mensual"
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
                    <div className="grid gap-4 grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="durationDays">Duración (días)</Label>
                            <Input
                                id="durationDays"
                                name="durationDays"
                                type="number"
                                placeholder="30"
                                defaultValue={membership?.durationDays || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="classCount">Clases</Label>
                            <Input
                                id="classCount"
                                name="classCount"
                                type="number"
                                placeholder="10"
                                defaultValue={membership?.classCount || ""}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Indica duración en días O cantidad de clases (no ambos)
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Descripción opcional..."
                            defaultValue={membership?.description || ""}
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen && setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Guardar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
