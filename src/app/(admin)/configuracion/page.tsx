"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGymSettings, updateGymSettings, GymSettingsData } from "@/app/actions/settings";
import { toast } from "sonner";
import {
    Loader2,
    Save,
    Settings as SettingsIcon,
    Tag as TagIcon,
    Users,
    CalendarClock,
    Trophy,
    Check,
    Briefcase,
    Heart,
    Smartphone,
    Instagram,
    MapPin,
    Phone,
    Palette
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState<GymSettingsData>({
        gymName: "",
        timezone: "",
        checkInEarlyMinutes: 15,
        checkInLateMinutes: 40,
        bookingMaxDaysInAdvance: 7,
        lateCancellationHours: 2,
        consecutiveNoShowsLimit: 3,
        walletPassBackgroundColor: "#000000",
        walletInstagram: "",
        walletAddress: "",
        walletPhone: "",
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
                    bookingMaxDaysInAdvance: data.bookingMaxDaysInAdvance,
                    lateCancellationHours: data.lateCancellationHours,
                    consecutiveNoShowsLimit: data.consecutiveNoShowsLimit,
                    walletPassBackgroundColor: data.walletPassBackgroundColor,
                    walletInstagram: data.walletInstagram || "",
                    walletAddress: data.walletAddress || "",
                    walletPhone: data.walletPhone || "",
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
            [name]: name.includes("Minutes") || name.includes("Days") || name.includes("Hours") || name.includes("Limit")
                ? parseInt(value) || 0
                : value
        }));
    };

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
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-3 rounded-full border border-amber-500/15">
                    <SettingsIcon className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">Configuración</h1>
                    <p className="text-sm text-zinc-400">
                        Gestiona y personaliza las opciones globales de tu academia
                    </p>
                </div>
            </div>

            {/* Main Tabs Container */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="general" className="w-full space-y-6">
                    <TabsList className="bg-zinc-900 border border-zinc-850 p-1 rounded-xl w-full grid grid-cols-3 max-w-lg">
                        <TabsTrigger value="general" className="rounded-lg text-xs md:text-sm font-semibold transition-all">General</TabsTrigger>
                        <TabsTrigger value="policies" className="rounded-lg text-xs md:text-sm font-semibold transition-all">Políticas</TabsTrigger>
                        <TabsTrigger value="branding" className="rounded-lg text-xs md:text-sm font-semibold transition-all">Branding & Passes</TabsTrigger>
                    </TabsList>

                    {/* TAB INDEX 1: GENERAL */}
                    <TabsContent value="general">
                        <Card className="border-zinc-900 bg-zinc-900/30 backdrop-blur-xl shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-white">Preferencia Generales</CardTitle>
                                <CardDescription className="text-xs text-zinc-400">Datos primarios de localización e intervalos de asistencia</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="gymName" className="text-zinc-300 font-medium">Nombre del Gimnasio</Label>
                                    <Input
                                        id="gymName"
                                        name="gymName"
                                        value={formData.gymName}
                                        onChange={handleChange}
                                        className="bg-black/40 border-zinc-850 text-white rounded-lg focus:ring-amber-500/50"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone" className="text-zinc-300 font-medium">Zona Horaria (IANA)</Label>
                                    <Input
                                        id="timezone"
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleChange}
                                        className="bg-black/40 border-zinc-850 text-white rounded-lg focus:ring-amber-500/50"
                                        required
                                    />
                                    <p className="text-xs text-zinc-500 font-medium">Ej: Europe/Madrid, America/New_York</p>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="checkInEarlyMinutes" className="text-zinc-300 font-medium">Check-in anticipado (min)</Label>
                                        <Input
                                            id="checkInEarlyMinutes"
                                            name="checkInEarlyMinutes"
                                            type="number"
                                            value={formData.checkInEarlyMinutes}
                                            onChange={handleChange}
                                            className="bg-black/40 border-zinc-850 text-white rounded-lg focus:ring-amber-500/50"
                                            required
                                        />
                                        <p className="text-[11px] text-zinc-500">Minutos permitidos antes de iniciar la sesión</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="checkInLateMinutes" className="text-zinc-300 font-medium">Check-in tardío (min)</Label>
                                        <Input
                                            id="checkInLateMinutes"
                                            name="checkInLateMinutes"
                                            type="number"
                                            value={formData.checkInLateMinutes}
                                            onChange={handleChange}
                                            className="bg-black/40 border-zinc-850 text-white rounded-lg focus:ring-amber-500/50"
                                            required
                                        />
                                        <p className="text-[11px] text-zinc-500">Minutos permitidos después de iniciar la clase</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB INDEX 2: POLICIES */}
                    <TabsContent value="policies">
                        <Card className="border-zinc-900 bg-zinc-900/30 backdrop-blur-xl shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-white">Políticas de Reservas</CardTitle>
                                <CardDescription className="text-xs text-zinc-400">Reglas asociadas al portal del alumno y no-shows</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="bookingMaxDaysInAdvance" className="text-zinc-300 font-medium">Límite de Reserva Anticipada (días)</Label>
                                    <Input
                                        id="bookingMaxDaysInAdvance"
                                        name="bookingMaxDaysInAdvance"
                                        type="number"
                                        value={formData.bookingMaxDaysInAdvance}
                                        onChange={handleChange}
                                        className="bg-black/40 border-zinc-850 text-white rounded-lg focus:ring-amber-500/50"
                                        required
                                    />
                                    <p className="text-[11px] text-zinc-500">Número máximo de días previos para los que un deportista puede agendar cupo</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lateCancellationHours" className="text-zinc-300 font-medium">Límite Cancelación Tardía (horas)</Label>
                                    <Input
                                        id="lateCancellationHours"
                                        name="lateCancellationHours"
                                        type="number"
                                        value={formData.lateCancellationHours}
                                        onChange={handleChange}
                                        className="bg-black/40 border-zinc-850 text-white rounded-lg focus:ring-amber-500/50"
                                        required
                                    />
                                    <p className="text-[11px] text-zinc-500">Plazo mínimo antes de la clase para cancelar sin penalización en el sistema</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="consecutiveNoShowsLimit" className="text-zinc-300 font-medium">Tolerancia Inasistencias (No-Shows)</Label>
                                    <Input
                                        id="consecutiveNoShowsLimit"
                                        name="consecutiveNoShowsLimit"
                                        type="number"
                                        value={formData.consecutiveNoShowsLimit}
                                        onChange={handleChange}
                                        className="bg-black/40 border-zinc-850 text-white rounded-lg focus:ring-amber-500/50"
                                        required
                                    />
                                    <p className="text-[11px] text-zinc-500">Cantidad máxima permitida de inasistencias injustificadas acumuladas</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB INDEX 3: BRANDING */}
                    <TabsContent value="branding">
                        <Card className="border-zinc-900 bg-zinc-900/30 backdrop-blur-xl shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-white">Apple Wallet & Branding</CardTitle>
                                <CardDescription className="text-xs text-zinc-400">Personaliza la tarjeta Wallet digital y el reverso del pase</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="walletPassBackgroundColor" className="text-zinc-300 font-medium flex items-center gap-1.5">
                                        <Palette className="w-4 h-4 text-zinc-450" /> Color de Fondo del Pase (Hex)
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="walletPassBackgroundColor"
                                            name="walletPassBackgroundColor"
                                            value={formData.walletPassBackgroundColor}
                                            onChange={handleChange}
                                            className="bg-black/40 border-zinc-850 text-white rounded-lg font-mono placeholder:text-zinc-700"
                                            required
                                        />
                                        <div
                                            className="w-10 h-10 rounded-lg border border-zinc-800 shadow"
                                            style={{ backgroundColor: formData.walletPassBackgroundColor }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-zinc-500">Color que teñirá el Wallet en los dispositivos iOS (por defecto #000000 negro)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="walletInstagram" className="text-zinc-300 font-medium flex items-center gap-1.5">
                                        <Instagram className="w-4 h-4 text-zinc-450" /> Perfil de Instagram
                                    </Label>
                                    <Input
                                        id="walletInstagram"
                                        name="walletInstagram"
                                        value={formData.walletInstagram || ""}
                                        onChange={handleChange}
                                        placeholder="@mi_academia"
                                        className="bg-black/40 border-zinc-850 text-white rounded-lg"
                                    />
                                    <p className="text-[11px] text-zinc-500">Se adjunta en la parte posterior del pase de Apple Wallet</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="walletAddress" className="text-zinc-300 font-medium flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-zinc-450" /> Dirección de la Sede
                                    </Label>
                                    <Input
                                        id="walletAddress"
                                        name="walletAddress"
                                        value={formData.walletAddress || ""}
                                        onChange={handleChange}
                                        placeholder="Calle Ejemplo 123, Madrid"
                                        className="bg-black/40 border-zinc-850 text-white rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="walletPhone" className="text-zinc-300 font-medium flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-zinc-450" /> Teléfono de Contacto
                                    </Label>
                                    <Input
                                        id="walletPhone"
                                        name="walletPhone"
                                        value={formData.walletPhone || ""}
                                        onChange={handleChange}
                                        placeholder="+34 600 000 000"
                                        className="bg-black/40 border-zinc-850 text-white rounded-lg"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Submit button bar */}
                <div className="flex justify-end gap-3 border-t border-zinc-900 pt-6">
                    <Button type="submit" disabled={saving || saved} className="w-full sm:w-auto bg-white text-zinc-950 font-bold hover:bg-zinc-200 shadow">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saved ? (
                            <><Check className="mr-2 h-4 w-4" />Guardado</>
                        ) : (
                            <><Save className="mr-2 h-4 w-4" />Guardar Ajustes</>
                        )}
                    </Button>
                </div>
            </form>

            <div className="border-t border-zinc-900 my-6" />

            {/* Quick Links Section */}
            <div>
                <h3 className="text-base font-bold text-zinc-200 mb-4">Gestiones Específicas</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <a
                        href="/configuracion/entrenadores"
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-850 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/10">
                                <Users className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">Entrenadores</p>
                                <p className="text-xs text-zinc-400">Administrar cronogramas y suplencias</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href="/configuracion/etiquetas"
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-850 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/10">
                                <TagIcon className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">Etiquetas</p>
                                <p className="text-xs text-zinc-400">Categorías de atletas y tags visuales</p>
                            </div>
                        </div>
                    </a>

                    <Link
                        href="/configuracion/horarios"
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-850 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/10">
                                <CalendarClock className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">Horarios</p>
                                <p className="text-xs text-zinc-400">Patrones y plantillas semanales</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/configuracion/clases"
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-850 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/10">
                                <SettingsIcon className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">Tipos de Clase</p>
                                <p className="text-xs text-zinc-400">Personalizar disciplinas deportivas</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/configuracion/competencias"
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-850 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/10">
                                <Trophy className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">Competencias</p>
                                <p className="text-xs text-zinc-400">Categorías de peso y eventos activos</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
