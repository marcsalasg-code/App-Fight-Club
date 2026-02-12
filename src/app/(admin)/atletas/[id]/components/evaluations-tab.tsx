"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2, FileText, Ruler, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { createEvaluation, deleteEvaluation, EvaluationFormData } from "@/actions/evaluations";
import { Badge } from "@/components/ui/badge";

type Evaluation = {
    id: string;
    date: Date;
    weight: number | null;
    height: number | null;
    bodyFat: number | null;
    technicalNotes: string | null;
    coachNotes: string | null;
};

type Props = {
    athleteId: string;
    evaluations: Evaluation[];
};

export function EvaluationsTab({ athleteId, evaluations }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Sort by date desc
    const sortedEvaluations = [...evaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const data: EvaluationFormData = {
                athleteId,
                date: new Date(formData.get("date") as string || new Date().toISOString()),
                weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
                height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
                bodyFat: formData.get("bodyFat") ? parseFloat(formData.get("bodyFat") as string) : null,
                technicalNotes: formData.get("technicalNotes") as string || null,
                coachNotes: formData.get("coachNotes") as string || null,
            };

            const res = await createEvaluation(data);

            if (res.success) {
                toast.success("Evaluación registrada");
                setIsOpen(false);
            } else {
                toast.error(res.error);
            }
        } catch (err) {
            toast.error("Ocurrió un error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta evaluación?")) return;
        setIsDeleting(id);
        const res = await deleteEvaluation(id, athleteId);
        setIsDeleting(null);
        if (res.success) {
            toast.success("Evaluación eliminada");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Evaluaciones Físicas y Técnicas</CardTitle>
                    <CardDescription>Registro del progreso físico y técnico del atleta</CardDescription>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Evaluación
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Registrar Evaluación</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Fecha</Label>
                                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Peso (kg)</Label>
                                    <div className="relative">
                                        <Weight className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="weight" name="weight" type="number" step="0.1" className="pl-9" placeholder="0.0" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height">Altura (cm)</Label>
                                    <div className="relative">
                                        <Ruler className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="height" name="height" type="number" className="pl-9" placeholder="0" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bodyFat">% Grasa</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="bodyFat" name="bodyFat" type="number" step="0.1" className="pl-9" placeholder="0.0" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="technicalNotes">Notas Técnicas</Label>
                                <Textarea id="technicalNotes" name="technicalNotes" placeholder="Progreso en técnicas, áreas a mejorar..." />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coachNotes">Notas del Coach (Privado)</Label>
                                <Textarea id="coachNotes" name="coachNotes" placeholder="Observaciones internas..." />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Evaluación"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {evaluations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay evaluaciones registradas</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedEvaluations.map((evalItem) => (
                            <div key={evalItem.id} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {format(new Date(evalItem.date), "PPP", { locale: es })}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(evalItem.id)}
                                        disabled={isDeleting === evalItem.id}
                                        className="text-destructive hover:text-destructive/90 h-8"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Metrics */}
                                <div className="flex flex-wrap gap-4">
                                    {evalItem.weight && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Weight className="h-3 w-3" /> {evalItem.weight} kg
                                        </Badge>
                                    )}
                                    {evalItem.height && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Ruler className="h-3 w-3" /> {evalItem.height} cm
                                        </Badge>
                                    )}
                                    {evalItem.bodyFat && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Activity className="h-3 w-3" /> {evalItem.bodyFat}% grasa
                                        </Badge>
                                    )}
                                </div>

                                {/* Notes */}
                                {(evalItem.technicalNotes || evalItem.coachNotes) && (
                                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-muted/20 p-3 rounded-md">
                                        {evalItem.technicalNotes && (
                                            <div>
                                                <span className="font-semibold block mb-1">Técnica:</span>
                                                <p className="text-muted-foreground">{evalItem.technicalNotes}</p>
                                            </div>
                                        )}
                                        {evalItem.coachNotes && (
                                            <div>
                                                <span className="font-semibold block mb-1">Coach:</span>
                                                <p className="text-muted-foreground">{evalItem.coachNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}

function Activity(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
