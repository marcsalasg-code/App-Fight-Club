"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Tag as TagIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createTag, deleteTag, getTags } from "./actions";

type Tag = {
    id: string;
    label: string;
    color: string;
    _count: { athletes: number };
};

const COLORS = [
    { label: "Rojo", value: "#EF4444" },
    { label: "Naranja", value: "#F97316" },
    { label: "Ámbar", value: "#F59E0B" },
    { label: "Verde", value: "#10B981" },
    { label: "Azul", value: "#3B82F6" },
    { label: "Índigo", value: "#6366F1" },
    { label: "Violeta", value: "#8B5CF6" },
    { label: "Rosa", value: "#EC4899" },
];

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState(COLORS[0].value);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTags();
    }, []);

    async function loadTags() {
        const res = await getTags();
        if (res.success && res.data) {
            setTags(res.data);
        }
        setLoading(false);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newLabel) return;

        const res = await createTag(newLabel, newColor);
        if (res.success && res.data) {
            toast.success("Etiqueta creada");
            setNewLabel("");
            loadTags();
        } else {
            toast.error("Error al crear etiqueta");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Seguro que quieres eliminar esta etiqueta?")) return;
        const res = await deleteTag(id);
        if (res.success) {
            toast.success("Etiqueta eliminada");
            loadTags();
        } else {
            toast.error("Error al eliminar");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/configuracion">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Etiquetas</h1>
                    <p className="text-muted-foreground">
                        Crea etiquetas para categorizar a tus atletas
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Nueva Etiqueta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="Ej. Lesionado"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setNewColor(c.value)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${newColor === c.value ? 'border-black scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Etiqueta
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Etiquetas Existentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {loading ? (
                                <p className="text-sm text-muted-foreground">Cargando...</p>
                            ) : tags.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay etiquetas creadas.</p>
                            ) : (
                                tags.map((tag) => (
                                    <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            <span className="font-medium">{tag.label}</span>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                {tag._count.athletes} atletas
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(tag.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
