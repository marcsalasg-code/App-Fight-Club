"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createCompetition, getCompetitorAthletes, CompetitionFormData } from "./actions";
import { toast } from "sonner";
import { Plus, Loader2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

type Athlete = {
    id: string;
    firstName: string;
    lastName: string;
    competitionCategory: string | null;
};

export function NewCompetitionModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            getCompetitorAthletes().then((res) => {
                if (res.success) setAthletes(res.data || []);
            });
        }
    }, [open]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data: CompetitionFormData = {
            athleteId: formData.get("athleteId") as string,
            eventName: formData.get("eventName") as string,
            date: formData.get("date") as string,
            result: formData.get("result") as string || undefined,
            category: formData.get("category") as string || undefined,
            weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined,
            notes: formData.get("notes") as string || undefined,
        };

        const result = await createCompetition(data);
        setLoading(false);

        if (result.success) {
            toast.success("Competencia registrada");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Error al crear");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Competencia
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Nueva Competencia
                    </DialogTitle>
                    <DialogDescription>
                        Registra una nueva competencia para un atleta
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Atleta *</Label>
                        <Select name="athleteId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar atleta" />
                            </SelectTrigger>
                            <SelectContent>
                                {athletes.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.firstName} {a.lastName}
                                        {a.competitionCategory && ` (${a.competitionCategory})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eventName">Nombre del Evento *</Label>
                        <Input
                            id="eventName"
                            name="eventName"
                            required
                            placeholder="Ej: Campeonato Regional 2026"
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
                            <Label>Resultado</Label>
                            <Select name="result" defaultValue="PENDING">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pendiente</SelectItem>
                                    <SelectItem value="WON">Victoria</SelectItem>
                                    <SelectItem value="LOST">Derrota</SelectItem>
                                    <SelectItem value="DRAW">Empate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Input
                                id="category"
                                name="category"
                                placeholder="Ej: Amateur B"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">Peso (kg)</Label>
                            <Input
                                id="weight"
                                name="weight"
                                type="number"
                                step="0.1"
                                placeholder="Ej: 67.5"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
