"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGymSettings, updateGymSettings, GymSettingsData } from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2, Save, Settings as SettingsIcon, Tag as TagIcon, Users, CalendarClock, Trophy, Check } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<GymSettingsData>({
        gymName: "",
        timezone: "",
        checkInEarlyMinutes: 15,
        checkInLateMinutes: 40,
    });

    useEffect(() => {
        async function load() {
            const data = await getGymSettings();
            if (data) {
                setFormData({
                    gymName: data.gymName,
                    timezone: data.timezone,
                    checkInEarlyMinutes: data.checkInEarlyMinutes,
                    checkInLateMinutes: data.checkInLateMinutes,
                });
            }
            setLoading(false);
        }
        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes("Minutes") ? parseInt(value) : value
        }));
    };

    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const result = await updateGymSettings(formData);
        setSaving(false);
        if (result.success) {
            setSaved(true);
            toast.success("Configuración guardada correctamente");
            setTimeout(() => setSaved(false), 2000);
        } else {
            toast.error(result.error || "Error al guardar");
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <SettingsIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Configuración</h1>
                    <p className="text-muted-foreground">
                        Gestiona las opciones globales del gimnasio
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Preferencias Generales</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="gymName">Nombre del Gimnasio</Label>
                            <Input
                                id="gymName"
                                name="gymName"
                                value={formData.gymName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timezone">Zona Horaria (IANA)</Label>
                            <Input
                                id="timezone"
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Ej: Europe/Madrid, America/New_York</p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="checkInEarlyMinutes">Check-in anticipado (min)</Label>
                                <Input
                                    id="checkInEarlyMinutes"
                                    name="checkInEarlyMinutes"
                                    type="number"
                                    value={formData.checkInEarlyMinutes}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Minutos antes de la clase permitidos</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="checkInLateMinutes">Check-in tardío (min)</Label>
                                <Input
                                    id="checkInLateMinutes"
                                    name="checkInLateMinutes"
                                    type="number"
                                    value={formData.checkInLateMinutes}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Minutos después del inicio permitidos</p>
                            </div>
                        </div>

                        <Button type="submit" disabled={saving || saved} className="w-full sm:w-auto">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {saved ? (
                                <><Check className="mr-2 h-4 w-4" />Guardado</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" />Guardar Cambios</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Gestión</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <a
                        href="/configuracion/entrenadores"
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Entrenadores</p>
                                <p className="text-xs text-muted-foreground">Gestiona el equipo</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href="/configuracion/etiquetas"
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <TagIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Etiquetas</p>
                                <p className="text-xs text-muted-foreground">Categorías de atletas</p>
                            </div>
                        </div>
                    </a>

                    <Link
                        href="/configuracion/horarios"
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <CalendarClock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Horarios</p>
                                <p className="text-xs text-muted-foreground">Patrones de clases</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/configuracion/clases"
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <SettingsIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Tipos de Clase</p>
                                <p className="text-xs text-muted-foreground">Personalizar disciplinas</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/configuracion/competencias"
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Trophy className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Competencias</p>
                                <p className="text-xs text-muted-foreground">Categorías y eventos</p>
                            </div>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
