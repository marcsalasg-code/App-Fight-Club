"use client";

import { useState, useEffect, useTransition } from "react";
import {
    getAthleteByPin,
    createBooking,
    cancelBooking,
    getScheduleForReservations
} from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, LogOut, CheckCircle2, Calendar, User, Info, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AthleteSession {
    id: string;
    firstName: string;
    lastName: string;
    pin: string;
    subscription: {
        id: string;
        membershipName: string;
        weeklyLimit: number | null;
    } | null;
}

export default function ReservationPage() {
    const [pin, setPin] = useState("");
    const [athlete, setAthlete] = useState<AthleteSession | null>(null);
    const [loadingPin, setLoadingPin] = useState(false);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [weeklyUsed, setWeeklyUsed] = useState(0);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [isPending, startTransition] = useTransition();

    // 1. Load schedule once authenticated
    const loadSchedule = async (athleteId: string) => {
        setLoadingSchedule(true);
        try {
            const res = await getScheduleForReservations(athleteId);
            if (res.success) {
                setSchedule(res.schedule || []);
                setWeeklyUsed(res.weeklyUsed || 0);
            } else {
                toast.error(res.error || "No se pudo cargar el listado de clases");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setLoadingSchedule(false);
        }
    };

    // 2. Submit PIN to log in athlete
    const handlePinSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (pin.length < 4) return;

        setLoadingPin(true);
        try {
            const res = await getAthleteByPin(pin);
            if (res.success && res.athlete) {
                setAthlete(res.athlete as AthleteSession);
                await loadSchedule(res.athlete.id);
                toast.success(`¡Bienvenido, ${res.athlete.firstName}!`);
            } else {
                toast.error(res.error || "PIN incorrecto");
                setPin("");
            }
        } catch (error) {
            toast.error("Error al autenticar");
        } finally {
            setLoadingPin(false);
        }
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only numbers
        const clean = e.target.value.replace(/\D/g, "");
        if (clean.length <= 4) {
            setPin(clean);
        }
    };

    // Auto submit pin when length is 4
    useEffect(() => {
        if (pin.length === 4 && !athlete) {
            handlePinSubmit();
        }
    }, [pin]);

    // 3. Handle Reservation toggle
    const handleBookingToggle = async (occurrence: any) => {
        if (!athlete) return;

        const dateStr = occurrence.date;
        const classId = occurrence.classId;

        startTransition(async () => {
            if (occurrence.isBooked) {
                // Cancel booking
                const res = await cancelBooking(athlete.id, classId, dateStr);
                if (res.success) {
                    toast.success("Reserva cancelada correctamente");
                    await loadSchedule(athlete.id);
                } else {
                    toast.error(res.error || "Error al cancelar la reserva");
                }
            } else {
                // Create booking
                const res = await createBooking(athlete.id, classId, dateStr);
                if (res.success) {
                    toast.success("¡Clase reservada con éxito!");
                    await loadSchedule(athlete.id);
                } else {
                    toast.error(res.error || "No se pudo realizar la reserva");
                }
            }
        });
    };

    // 4. Logout / Reset state
    const handleLogout = () => {
        setAthlete(null);
        setPin("");
        setSchedule([]);
        toast.info("Sesión cerrada");
    };

    return (
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-brand-gold/30 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-900/40 rounded-full blur-[120px]" />
            </div>

            <AnimatePresence mode="wait">
                {!athlete ? (
                    // VIEW 1: Lock screen PIN Entry
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-1 flex flex-col items-center justify-center p-6 z-10"
                    >
                        <div className="w-full max-w-sm space-y-8 text-center">
                            <div className="space-y-4">
                                <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-brand-gold/10 relative">
                                    <Image src="/logo.png" alt="RC Fight Club" fill className="object-contain" priority />
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                                    Portal de Reservas
                                </h1>
                                <p className="text-sm text-zinc-500">
                                    Introduce tu PIN personal de 4 dígitos para gestionar tus reservas
                                </p>
                            </div>

                            <Card className="border-zinc-900 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
                                <CardContent className="pt-8 pb-6 px-6">
                                    <form onSubmit={handlePinSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={4}
                                                value={pin}
                                                onChange={handlePinChange}
                                                placeholder="••••"
                                                disabled={loadingPin}
                                                className="h-16 text-center text-3xl tracking-[0.5em] bg-black/40 border-zinc-800 text-white focus:ring-amber-500/50 focus:border-amber-500 placeholder:text-zinc-850 rounded-xl transition-all"
                                                autoFocus
                                                autoComplete="off"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto pt-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => !loadingPin && setPin(p => p.length < 4 ? p + num : p)}
                                                    className="w-16 h-16 rounded-full border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-800/40 text-2xl font-bold flex items-center justify-center transition-all active:scale-95"
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setPin("")}
                                                className="w-16 h-16 rounded-full text-xs font-semibold text-zinc-500 hover:text-zinc-300 flex items-center justify-center transition-all"
                                            >
                                                BORRAR
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => !loadingPin && setPin(p => p.length < 4 ? p + "0" : p)}
                                                className="w-16 h-16 rounded-full border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-800/40 text-2xl font-bold flex items-center justify-center transition-all active:scale-95"
                                            >
                                                0
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={pin.length < 4 || loadingPin}
                                                className="w-16 h-16 rounded-full text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center justify-center transition-all disabled:opacity-40"
                                            >
                                                {loadingPin ? <Loader2 className="w-5 h-5 animate-spin" /> : "IR"}
                                            </button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="text-zinc-700 text-xs tracking-wider uppercase">
                                RC FIGHT CLUB &bull; RESERVA DE SESIONES
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // VIEW 2: Athlete Reservation Console
                    <motion.div
                        key="console"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="flex-1 flex flex-col z-10 w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6"
                    >
                        {/* Header Panel */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                    {athlete.firstName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">¡Hola, {athlete.firstName}!</h2>
                                    <p className="text-xs text-zinc-400 font-medium">
                                        Membresía: <span className="text-amber-400">{athlete.subscription?.membershipName || "Sin membresía activa"}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Weekly Limit Meter */}
                            {athlete.subscription && (
                                <div className="flex items-center gap-4 bg-black/40 border border-zinc-850 px-4 py-2.5 rounded-xl">
                                    <div className="text-right">
                                        <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">RESERVAS ESTA SEMANA</span>
                                        <span className="text-lg font-extrabold text-white">
                                            {weeklyUsed} / {athlete.subscription.weeklyLimit !== null ? athlete.subscription.weeklyLimit : "∞"}
                                        </span>
                                    </div>
                                    <div className="relative w-8 h-8 flex items-center justify-center">
                                        {athlete.subscription.weeklyLimit !== null ? (
                                            <svg className="w-8 h-8 transform -rotate-90">
                                                <circle cx="16" cy="16" r="14" className="stroke-zinc-800" strokeWidth="2.5" fill="transparent" />
                                                <circle
                                                    cx="16" cy="16" r="14"
                                                    className="stroke-amber-500 transition-all duration-500"
                                                    strokeWidth="2.5"
                                                    fill="transparent"
                                                    strokeDasharray={2 * Math.PI * 14}
                                                    strokeDashoffset={(2 * Math.PI * 14) * (1 - Math.min(weeklyUsed, athlete.subscription.weeklyLimit) / athlete.subscription.weeklyLimit)}
                                                />
                                            </svg>
                                        ) : (
                                            <CheckCircle2 className="w-6 h-6 text-amber-500 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="border-zinc-850 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white shrink-0 self-start md:self-auto gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Salir del portal
                            </Button>
                        </div>

                        {/* Schedule List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-amber-500" /> Próximas Clases Disponibles (7 días)
                                </h3>
                                {loadingSchedule && <Loader2 className="w-5 h-5 animate-spin text-zinc-650" />}
                            </div>

                            {loadingSchedule && schedule.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-zinc-900/10 border border-zinc-900 rounded-2xl">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                    <p className="text-sm text-zinc-500">Cargando la agenda de la academia...</p>
                                </div>
                            ) : schedule.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/10 border border-zinc-900 rounded-2xl p-6">
                                    <Info className="w-10 h-10 text-zinc-700 mb-2" />
                                    <p className="font-semibold text-zinc-400">No hay clases programadas esta semana</p>
                                    <p className="text-xs text-zinc-600">Por favor, inténtalo más tarde.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {schedule.map((slot) => {
                                        const dateObj = new Date(slot.date);
                                        const isFull = slot.bookingsCount >= slot.maxCapacity;

                                        return (
                                            <Card
                                                key={slot.id}
                                                className={`border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm hover:border-zinc-800 transition-all ${slot.isBooked ? "ring-1 ring-amber-500/25 bg-amber-950/5" : ""
                                                    }`}
                                            >
                                                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h4 className="font-bold text-base text-white tracking-tight truncate">
                                                                {slot.name}
                                                            </h4>
                                                            {slot.isBooked && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20 shadow-sm shrink-0">
                                                                    REGISTRADA
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Metadata Row */}
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                                                                <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                                <span>{format(dateObj, "EEEE, d 'de' MMMM", { locale: es })}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                                                                <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                                <span>{slot.startTime} - {slot.endTime}</span>
                                                            </div>
                                                            {slot.coaches && slot.coaches.length > 0 && (
                                                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                                                                    <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                                    <span className="truncate">Coach: {slot.coaches.map((c: any) => c.name).join(", ")}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 flex items-center justify-between gap-4">
                                                        {/* Dynamic occupancy counter */}
                                                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                            <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                            <span>
                                                                {slot.bookingsCount} / {slot.maxCapacity}
                                                            </span>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <Button
                                                            size="sm"
                                                            disabled={isPending || (!slot.isBooked && isFull)}
                                                            onClick={() => handleBookingToggle(slot)}
                                                            variant={slot.isBooked ? "destructive" : "secondary"}
                                                            className={`text-xs font-semibold px-4 transition-all rounded-lg shrink-0 ${slot.isBooked
                                                                    ? "bg-red-950/20 text-red-400 hover:bg-red-900/60 border border-red-500/20"
                                                                    : isFull
                                                                        ? "bg-zinc-900 text-zinc-650 cursor-not-allowed"
                                                                        : "bg-white text-zinc-950 hover:bg-zinc-200 border border-transparent shadow"
                                                                }`}
                                                        >
                                                            {isPending ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : slot.isBooked ? (
                                                                "Cancelar"
                                                            ) : isFull ? (
                                                                "Completo"
                                                            ) : (
                                                                "Reservar"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
