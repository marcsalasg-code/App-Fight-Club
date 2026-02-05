"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
// ... remove Dialog imports ...
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createEvent, EventFormData } from "./actions";
import { toast } from "sonner";
import { Plus, Loader2, CalendarRange } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewEventModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data: EventFormData = {
            name: formData.get("name") as string,
            date: formData.get("date") as string,
            location: formData.get("location") as string || undefined,
            type: formData.get("type") as string || undefined,
            weighInDate: formData.get("weighInDate") as string || undefined,
        };

        const result = await createEvent(data);
        setLoading(false);

        if (result.success) {
            toast.success("Evento creado correctamente");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Error al crear evento");
        }
    }

    return (
        <ResponsiveDialog
            isOpen={open}
            setIsOpen={setOpen}
            title="Nuevo Evento (Velada)"
            description="Registra una nueva velada o campeonato"
            trigger={
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Evento
                </Button>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Evento *</Label>
                    <Input
                        id="name"
                        name="name"
                        required
                        placeholder="Ej: Velada Fight Club V"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha *</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select name="type" defaultValue="MATCHMAKING">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MATCHMAKING">Velada (Matchmaking)</SelectItem>
                                <SelectItem value="TOURNAMENT">Torneo (Llaves)</SelectItem>
                                <SelectItem value="INTERCLUB">Interclub</SelectItem>
                                <SelectItem value="LEAGUE">Liga</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                        id="location"
                        name="location"
                        placeholder="Ej: Pabellón Municipal"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weighInDate">Fecha de Pesaje (Opcional)</Label>
                    <Input
                        id="weighInDate"
                        name="weighInDate"
                        type="datetime-local"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Evento
                    </Button>
                </div>
            </form>
        </ResponsiveDialog>
    );
}
