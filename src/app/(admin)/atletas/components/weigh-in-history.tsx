"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2, LineChart as ChartIcon, List as ListIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createWeighIn, deleteWeighIn } from "../weigh-in-actions";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type WeighIn = {
    id: string;
    date: Date;
    weight: number;
    notes: string | null;
};

type Props = {
    athleteId: string;
    weighIns: WeighIn[];
};

export function WeighInHistory({ athleteId, weighIns }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Sort by date desc (newest first) for list
    const sortedHistory = [...weighIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Sort by date asc (oldest first) for chart
    const chartData = [...weighIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(w => ({
            date: format(new Date(w.date), "dd MMM", { locale: es }),
            weight: w.weight,
        }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const weight = parseFloat(formData.get("weight") as string);
            const dateStr = formData.get("date") as string;
            const date = dateStr ? new Date(dateStr) : new Date();
            const notes = formData.get("notes") as string;

            if (isNaN(weight)) {
                toast.error("El peso debe ser un número válido");
                setLoading(false);
                return;
            }

            const res = await createWeighIn(athleteId, weight, date, notes);

            if (res.success) {
                toast.success("Pesaje registrado");
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
        if (!confirm("¿Eliminar este registro?")) return;
        setIsDeleting(id);
        const res = await deleteWeighIn(id, athleteId);
        setIsDeleting(null);
        if (res.success) {
            toast.success("Registro eliminado");
        } else {
            toast.error(res.error);
        }
    };

    if (weighIns.length === 0) {
        return (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground mb-4">No hay registros de peso.</p>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Registrar Peso Inicial
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Pesaje</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="weight">Peso (kg)</Label>
                                <Input id="weight" name="weight" type="number" step="0.1" required placeholder="0.0" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Fecha</Label>
                                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea id="notes" name="notes" placeholder="Ej: Después de entrenar..." />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Guardando..." : "Guardar"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Historial de Peso</CardTitle>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Pesaje</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="weight">Peso (kg)</Label>
                                <Input id="weight" name="weight" type="number" step="0.1" required placeholder="0.0" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Fecha</Label>
                                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea id="notes" name="notes" placeholder="Ej: Después de entrenar..." />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Guardando..." : "Guardar"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="chart">
                    <TabsList className="mb-4">
                        <TabsTrigger value="chart">
                            <ChartIcon className="h-4 w-4 mr-2" />
                            Gráfica
                        </TabsTrigger>
                        <TabsTrigger value="list">
                            <ListIcon className="h-4 w-4 mr-2" />
                            Lista
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart" className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="weight" stroke="#8884d8" fillOpacity={1} fill="url(#colorWeight)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="list">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Peso</TableHead>
                                        <TableHead>Notas</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedHistory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(item.date), "dd MMM yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell>{item.weight} kg</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{item.notes || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isDeleting === item.id}
                                                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
