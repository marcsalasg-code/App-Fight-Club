
"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { updateEvent } from "./actions";
import { toast } from "sonner";
import { Loader2, Pencil, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

type EventData = {
    id: string;
    name: string;
    date: Date;
    location: string | null;
    type: string | null;
    weighInDate: Date | null;
};

interface Props {
    event: EventData;
}

export function EditEventModal({ event }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            date: formData.get("date") as string,
            location: formData.get("location") as string,
            type: formData.get("type") as string,
            weighInDate: formData.get("weighInDate") as string,
        };

        const result = await updateEvent(event.id, data);
        setLoading(false);

        if (result.success) {
            toast.success("Evento actualizado");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Error al actualizar");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Editar Evento
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Evento *</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            defaultValue={event.name}
                            placeholder="Ej: Velada de Boxeo - Junio"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha *</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            required
                            defaultValue={new Date(event.date).toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                            id="location"
                            name="location"
                            defaultValue={event.location || ""}
                            placeholder="Ej: Gimnasio Municipal"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Evento</Label>
                        <Input
                            id="type"
                            name="type"
                            defaultValue={event.type || ""}
                            placeholder="Ej: Interclub, Regional, Nacional"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="weighInDate">Fecha de Pesaje</Label>
                        <Input
                            id="weighInDate"
                            name="weighInDate"
                            type="datetime-local"
                            defaultValue={event.weighInDate ? new Date(event.weighInDate).toISOString().slice(0, 16) : ""}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
