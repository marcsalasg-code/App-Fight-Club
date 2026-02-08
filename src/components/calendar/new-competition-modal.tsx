"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createEvent, EventFormData } from "@/app/(admin)/competencias/actions";
import { useEventTypes } from "@/hooks/use-event-types";
import { toast } from "sonner";
import { Trophy, Loader2 } from "lucide-react"; // Changed icon to Trophy for competitions
import { useRouter } from "next/navigation";

export function NewCompetitionModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Dynamic Event Types
    const { types: eventTypes, loading: typesLoading } = useEventTypes();

    // Controlled state for type to allow default selection logic if needed
    // For now, simpler than ClassModal as we don't sync colors (yet)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        const data: EventFormData = {
            name: formData.get("name") as string,
            date: formData.get("date") as string + "T" + (formData.get("time") as string || "09:00") + ":00", // Combine date and time
            type: formData.get("type") as string,
            location: formData.get("location") as string,
            weighInDate: formData.get("weighInDate") ? (formData.get("weighInDate") as string + "T09:00:00") : undefined, // Default weigh-in time
        };

        const result = await createEvent(data);
        setLoading(false);

        if (result.success) {
            toast.success("Evento creado exitosamente");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Error al crear el evento");
        }
    }

    return (
        <ResponsiveDialog
            isOpen={open}
            setIsOpen={setOpen}
            title="Nuevo Evento"
            description="Programa una nueva competición o evento"
            trigger={
                <Button variant="secondary" className="gap-2">
                    <Trophy className="h-4 w-4" />
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
                        placeholder="Ej: Torneo Regional Muay Thai"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Tipo *</Label>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {typesLoading ? (
                                    <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
                                ) : (
                                    eventTypes.map(type => (
                                        <SelectItem key={type.id} value={type.label}>
                                            {type.label}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                            id="location"
                            name="location"
                            placeholder="Ej: Pabellón Municipal"
                        />
                    </div>
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
                        <Label htmlFor="time">Hora *</Label>
                        <Input
                            id="time"
                            name="time"
                            type="time"
                            required
                            defaultValue="09:00"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weighInDate">Fecha Pesaje (Opcional)</Label>
                    <Input
                        id="weighInDate"
                        name="weighInDate"
                        type="date"
                    />
                    <p className="text-[10px] text-muted-foreground">Se asumirá las 09:00 AM por defecto</p>
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
