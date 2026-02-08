"use client";

import { useState, useEffect } from "react";
import {
    getCompetitionCategories, createCompetitionCategory, updateCompetitionCategory, deleteCompetitionCategory,
    getEventTypes, createEventType, deleteEventType,
    CategoryData
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Category = CategoryData & { id: string };
type EventType = { id: string; label: string; active: boolean };

export function CompetitionsManager() {
    // Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [catModalOpen, setCatModalOpen] = useState(false);
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Forms
    const [catForm, setCatForm] = useState<CategoryData>({
        name: "",
        gender: "MALE",
        active: true
    });
    const [eventFormLabel, setEventFormLabel] = useState("");

    const loadData = async () => {
        setLoading(true);
        const [catsRes, eventsRes] = await Promise.all([
            getCompetitionCategories(),
            getEventTypes()
        ]);

        if (catsRes.success && catsRes.data) setCategories(catsRes.data as Category[]);
        if (eventsRes.success && eventsRes.data) setEventTypes(eventsRes.data as EventType[]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- CATEGORY HANDLERS ---

    const handleCreateCat = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Basic validation depending on logic, for now straightforward
        const res = await createCompetitionCategory(catForm);

        setIsSubmitting(false);
        if (res.success) {
            toast.success("Categoría creada");
            setCatModalOpen(false);
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const handleEditCat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCat) return;
        setIsSubmitting(true);

        const res = await updateCompetitionCategory(editingCat.id, catForm);

        setIsSubmitting(false);
        if (res.success) {
            toast.success("Categoría actualizada");
            setCatModalOpen(false);
            setEditingCat(null);
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const handleDeleteCat = async (id: string) => {
        if (!confirm("¿Eliminar categoría?")) return;
        const res = await deleteCompetitionCategory(id);
        if (res.success) {
            toast.success("Eliminada");
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const openCatModal = (cat?: Category) => {
        if (cat) {
            setEditingCat(cat);
            setCatForm({
                name: cat.name,
                gender: cat.gender || "MALE",
                minWeight: cat.minWeight,
                maxWeight: cat.maxWeight,
                active: cat.active
            });
        } else {
            setEditingCat(null);
            setCatForm({ name: "", gender: "MALE", active: true });
        }
        setCatModalOpen(true);
    };

    // --- EVENT TYPE HANDLERS ---

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await createEventType(eventFormLabel);
        setIsSubmitting(false);

        if (res.success) {
            toast.success("Tipo de evento creado");
            setEventModalOpen(false);
            setEventFormLabel("");
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("¿Eliminar tipo de evento?")) return;
        const res = await deleteEventType(id);
        if (res.success) {
            toast.success("Eliminado");
            loadData();
        } else {
            toast.error(res.error);
        }
    };


    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Tabs defaultValue="categories" className="space-y-6">
            <TabsList>
                <TabsTrigger value="categories">Categorías ({categories.length})</TabsTrigger>
                <TabsTrigger value="events">Tipos de Evento ({eventTypes.length})</TabsTrigger>
            </TabsList>

            {/* CATEGORIES TAB */}
            <TabsContent value="categories" className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Categorías de Peso y Nivel</h2>
                    <Button onClick={() => openCatModal()}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                    </Button>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Género</TableHead>
                                <TableHead>Rango Peso</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map(cat => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{cat.gender}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {cat.minWeight ? `> ${cat.minWeight}kg` : ""}
                                        {cat.minWeight && cat.maxWeight ? " - " : ""}
                                        {cat.maxWeight ? `< ${cat.maxWeight}kg` : ""}
                                        {!cat.minWeight && !cat.maxWeight ? "Open" : ""}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openCatModal(cat)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:text-red-500" onClick={() => handleDeleteCat(cat.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCat ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={editingCat ? handleEditCat : handleCreateCat} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={catForm.name}
                                    onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                                    placeholder="Ej. Adulto -70kg"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Género</Label>
                                <Select
                                    value={catForm.gender}
                                    onValueChange={v => setCatForm({ ...catForm, gender: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Masculino</SelectItem>
                                        <SelectItem value="FEMALE">Femenino</SelectItem>
                                        <SelectItem value="MIXED">Mixto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Peso Mínimo (kg)</Label>
                                    <Input
                                        type="number" step="0.1"
                                        value={catForm.minWeight || ""}
                                        onChange={e => setCatForm({ ...catForm, minWeight: e.target.valueAsNumber || undefined })}
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Peso Máximo (kg)</Label>
                                    <Input
                                        type="number" step="0.1"
                                        value={catForm.maxWeight || ""}
                                        onChange={e => setCatForm({ ...catForm, maxWeight: e.target.valueAsNumber || undefined })}
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </TabsContent>

            {/* EVENTS TAB */}
            <TabsContent value="events" className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Tipos de Evento</h2>
                    <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Tipo</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Nuevo Tipo de Evento</DialogTitle></DialogHeader>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        value={eventFormLabel}
                                        onChange={e => setEventFormLabel(e.target.value)}
                                        placeholder="Ej. Torneo Regional"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>Guardar</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {eventTypes.map(ev => (
                                <TableRow key={ev.id}>
                                    <TableCell>{ev.label}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="hover:text-red-500" onClick={() => handleDeleteEvent(ev.id)}>
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
    );
}
