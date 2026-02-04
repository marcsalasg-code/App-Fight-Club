"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getPatterns, createPattern, deletePattern, applyPatternToSchedule } from "./actions";
import { Checkbox } from "@/components/ui/checkbox";

type Pattern = {
    id: string;
    name: string;
    type: string;
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    maxCapacity: number;
    color: string;
    levelRequired: string | null;
};

const weekDays = [
    { id: "MONDAY", label: "Lunes" },
    { id: "TUESDAY", label: "Martes" },
    { id: "WEDNESDAY", label: "Miércoles" },
    { id: "THURSDAY", label: "Jueves" },
    { id: "FRIDAY", label: "Viernes" },
    { id: "SATURDAY", label: "Sábado" },
    { id: "SUNDAY", label: "Domingo" },
];

export default function PatternsPage() {
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [formColor, setFormColor] = useState("#D4AF37");

    const loadData = async () => {
        setLoading(true);
        const res = await getPatterns();
        if (res.success && res.data) {
            setPatterns(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            const data = {
                name: formData.get("name") as string,
                type: formData.get("type") as string,
                daysOfWeek: selectedDays,
                startTime: formData.get("startTime") as string,
                endTime: formData.get("endTime") as string,
                maxCapacity: parseInt(formData.get("maxCapacity") as string),
                color: formColor,
                levelRequired: null, // Optional for now
            };

            if (selectedDays.length === 0) {
                toast.error("Selecciona al menos un día");
                return;
            }

            const res = await createPattern(data);
            if (res.success) {
                toast.success("Horario creado");
                setIsOpen(false);
                loadData();
            } else {
                toast.error(res.error);
            }
        } catch (err) {
            toast.error("Error al guardar");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este patrón? Esto no borrará clases ya creadas.")) return;
        const res = await deletePattern(id);
        if (res.success) {
            toast.success("Patrón eliminado");
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const handleApply = async (id: string) => {
        toast.promise(applyPatternToSchedule(id), {
            loading: "Generando clases...",
            success: (data) => `Clases creadas: ${data.created} (Omitidas: ${data.skipped})`,
            error: "Error al generar clases",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Gestión de Horarios</h1>
                    <p className="text-muted-foreground">Define las clases recurrentes y genéralas en el calendario.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Horario
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Crear Patrón de Clase</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input id="name" name="name" placeholder="Ej: Muay Thai" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo</Label>
                                    <Select name="type" required defaultValue="MUAY_THAI">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MUAY_THAI">Muay Thai</SelectItem>
                                            <SelectItem value="KICKBOXING">Kickboxing</SelectItem>
                                            <SelectItem value="BOXING">Boxeo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Inicio</Label>
                                    <Input id="startTime" name="startTime" type="time" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endTime">Fin</Label>
                                    <Input id="endTime" name="endTime" type="time" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Días de la semana</Label>
                                <div className="flex flex-wrap gap-2">
                                    {weekDays.map(day => (
                                        <Badge
                                            key={day.id}
                                            variant={selectedDays.includes(day.id) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                if (selectedDays.includes(day.id)) {
                                                    setSelectedDays(selectedDays.filter(d => d !== day.id));
                                                } else {
                                                    setSelectedDays([...selectedDays, day.id]);
                                                }
                                            }}
                                        >
                                            {day.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxCapacity">Capacidad</Label>
                                    <Input id="maxCapacity" name="maxCapacity" type="number" defaultValue="20" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Color</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            id="color"
                                            name="color"
                                            type="color"
                                            value={formColor}
                                            onChange={(e) => setFormColor(e.target.value)}
                                            className="w-12 h-10 p-1"
                                        />
                                        <span className="text-sm text-muted-foreground">{formColor}</span>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full">Guardar Patrón</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Patrones Definidos</CardTitle>
                    <CardDescription>Estos son los horarios base. Usa "Generar" para crear las clases reales en el calendario.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Días</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell>
                                </TableRow>
                            ) : patterns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No hay patrones definidos. Crea uno nuevo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                patterns.map((pattern) => (
                                    <TableRow key={pattern.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: pattern.color }}
                                                />
                                                <span className="font-medium">{pattern.name}</span>
                                                <span className="text-xs text-muted-foreground">({pattern.type})</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {pattern.daysOfWeek.map(d => (
                                                    <Badge key={d} variant="secondary" className="text-[10px]">
                                                        {weekDays.find(wd => wd.id === d)?.label.substring(0, 3)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {pattern.startTime} - {pattern.endTime}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleApply(pattern.id)}
                                                    title="Generar clases en el calendario"
                                                >
                                                    <RefreshCw className="h-3 w-3 mr-2" />
                                                    Generar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(pattern.id)}
                                                    className="text-destructive hover:text-destructive/90"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
