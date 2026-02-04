"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarRange, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { assignCoachesToClasses } from "./actions";

type Props = {
    coachId: string;
    coachName: string;
};

const DAYS = [
    { id: "MONDAY", label: "Lunes" },
    { id: "TUESDAY", label: "Martes" },
    { id: "WEDNESDAY", label: "Miércoles" },
    { id: "THURSDAY", label: "Jueves" },
    { id: "FRIDAY", label: "Viernes" },
    { id: "SATURDAY", label: "Sábado" },
    { id: "SUNDAY", label: "Domingo" },
];

const SHIFTS = [
    { id: "ALL", label: "Todo el día", start: "00:00", end: "23:59" },
    { id: "MORNING", label: "Mañanas (06:00 - 14:00)", start: "06:00", end: "14:00" },
    { id: "AFTERNOON", label: "Tardes (16:00 - 22:00)", start: "16:00", end: "22:00" },
];

export function BulkAssignDialog({ coachId, coachName }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedDays, setSelectedDays] = useState<string[]>(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
    const [selectedShift, setSelectedShift] = useState("ALL");

    const handleAssign = async () => {
        if (selectedDays.length === 0) {
            toast.error("Selecciona al menos un día");
            return;
        }

        setLoading(true);

        const shift = SHIFTS.find(s => s.id === selectedShift);

        const result = await assignCoachesToClasses(coachId, {
            days: selectedDays,
            startTime: shift?.start,
            endTime: shift?.end,
        });

        setLoading(false);

        if (result.success) {
            toast.success(`Entrenador asignado a ${result.count} clases`);
            setOpen(false);
        } else {
            toast.error(result.error || "Error al asignar clases");
        }
    };

    const toggleDay = (dayId: string) => {
        setSelectedDays(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <CalendarRange className="h-4 w-4" />
                    Asignar Horario
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignación Masiva</DialogTitle>
                    <DialogDescription>
                        Asigna a <strong>{coachName}</strong> a múltiples clases recurrentes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Shift Selector */}
                    <div className="space-y-2">
                        <Label>Turno Horario</Label>
                        <Select value={selectedShift} onValueChange={setSelectedShift}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SHIFTS.map(shift => (
                                    <SelectItem key={shift.id} value={shift.id}>
                                        {shift.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Day Selector */}
                    <div className="space-y-3">
                        <Label>Días de la semana</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {DAYS.map(day => (
                                <div key={day.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={day.id}
                                        checked={selectedDays.includes(day.id)}
                                        onCheckedChange={() => toggleDay(day.id)}
                                    />
                                    <Label
                                        htmlFor={day.id}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {day.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                        <p>
                            Esta acción añadirá al entrenador a todas las clases que coincidan con estos filtros, sin eliminar a los entrenadores existentes.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAssign} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Asignación
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
