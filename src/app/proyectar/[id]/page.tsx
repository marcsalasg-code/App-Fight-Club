"use client";

import { use, useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { generateClassQrPayload, getClassCheckInStream } from "@/app/actions/checkin";
import { Users, Loader2, Sparkles, Tv, HelpCircle, ArrowLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Sound chime for new checked-in athlete
function playChimeSound() {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();

        // Success high chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        // E5 then B5 (harmonic interval)
        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.setValueAtTime(987.77, now + 0.1);

        osc2.frequency.setValueAtTime(329.63, now); // E4 support
        osc2.frequency.setValueAtTime(493.88, now + 0.1);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.start(now);
        osc1.stop(now + 0.5);

        osc2.start(now);
        osc2.stop(now + 0.5);
    } catch (e) {
        console.warn("Chime blocked by browser policy", e);
    }
}

export default function ProyectarPage({ params }: PageProps) {
    const { id: classId } = use(params);

    const [className, setClassName] = useState<string>("Cargando...");
    const [maxCapacity, setMaxCapacity] = useState<number>(20);
    const [attendances, setAttendances] = useState<any[]>([]);

    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [latestWelcome, setLatestWelcome] = useState<string | null>(null);
    const welcomeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const initialFetchDone = useRef<boolean>(false);

    // Fetch initial details and load the list
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await getClassCheckInStream(classId);
                setClassName(data.className);
                setMaxCapacity(data.maxCapacity);
                setAttendances(data.attendances);
                initialFetchDone.current = true;
            } catch (err) {
                console.error("Error loading stream", err);
            } finally {
                setLoading(false);
            }
        };

        const generateQr = async () => {
            try {
                const newToken = await generateClassQrPayload(classId);
                const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
                setQrUrl(`${baseUrl}/checkin?token=${newToken}`);
            } catch (err) {
                console.error("Error generating QR", err);
            }
        };

        loadInitialData();
        generateQr();

        // Refresh QR Code every 25 seconds
        const qrInterval = setInterval(generateQr, 25000);
        return () => clearInterval(qrInterval);
    }, [classId]);

    // Poll check-in state and trigger animations
    useEffect(() => {
        if (!initialFetchDone.current) return;

        const interval = setInterval(async () => {
            try {
                const data = await getClassCheckInStream(classId);

                // Compare list size to detect new checked-in athletes
                if (data.attendances.length > attendances.length) {
                    const oldIds = new Set(attendances.map(a => a.id));
                    const newEntries = data.attendances.filter(a => !oldIds.has(a.id));

                    if (newEntries.length > 0) {
                        const newName = newEntries[0].athleteName;

                        // Clear old timer if active
                        if (welcomeTimerRef.current) {
                            clearTimeout(welcomeTimerRef.current);
                        }

                        setLatestWelcome(newName);
                        playChimeSound();

                        // Hide welcome banner after 6 seconds
                        welcomeTimerRef.current = setTimeout(() => {
                            setLatestWelcome(null);
                        }, 6000);
                    }
                }

                setAttendances(data.attendances);
            } catch (err) {
                console.error("Polled check-in failed", err);
            }
        }, 4000);

        return () => {
            clearInterval(interval);
            if (welcomeTimerRef.current) {
                clearTimeout(welcomeTimerRef.current);
            }
        };
    }, [classId, attendances]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-zinc-400 font-medium animate-pulse">Iniciando Pantalla del Box...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col justify-between p-6 md:p-10 relative selection:bg-primary selection:text-zinc-950">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

            {/* HEADER */}
            <header className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <Link href={`/clases/${classId}/checkin`} className="bg-zinc-900/60 hover:bg-zinc-800 p-2.5 rounded-lg border border-zinc-850 transition-all text-zinc-400 hover:text-zinc-100">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-wider uppercase text-zinc-400">PANTALLA DE CONTROL</h1>
                        <p className="text-2xl md:text-3xl font-extrabold text-foreground">{className}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-900/40 px-5 py-2.5 rounded-xl border border-zinc-900">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold text-zinc-400">PRESENCIA:</span>
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-primary font-mono leading-none">
                        {attendances.length}
                        <span className="text-zinc-550 text-lg font-medium ml-1">/ {maxCapacity}</span>
                    </span>
                </div>
            </header>

            {/* WELCOME OVERLAY BANNER */}
            {latestWelcome && (
                <div className="absolute top-28 left-6 right-6 z-50 animate-[slideDown_0.5s_ease-out]">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-300 p-1 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.4)]">
                        <div className="bg-zinc-950 p-6 md:p-8 rounded-[14px] text-center flex flex-col items-center justify-center space-y-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/[0.02] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1),transparent_70%)]" />
                            <Sparkles className="w-8 h-8 text-primary animate-bounce mb-2" />
                            <h2 className="text-lg md:text-xl font-extrabold tracking-[0.2em] text-primary uppercase">¡CHECK-IN REGISTRADO!</h2>
                            <p className="text-3xl md:text-6xl font-black bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 uppercase py-2 leading-tight">
                                {latestWelcome}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT SPLIT */}
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto z-10 w-full max-w-7xl mx-auto items-center">
                {/* LEFT: QR CODE CARD */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-900 shadow-2xl flex flex-col items-center justify-center text-center relative max-w-sm w-full">
                        <div className="absolute -top-3 -right-3 bg-primary text-zinc-950 font-bold px-3 py-1 rounded-md text-xs tracking-wider flex items-center gap-1 shadow-lg">
                            <Tv className="w-3.5 h-3.5" /> PULL-LIVE
                        </div>

                        {qrUrl ? (
                            <div className="p-4 bg-white rounded-2xl shadow-xl transition-all duration-300 scale-100 hover:scale-[1.02]">
                                <QRCode value={qrUrl} size={240} fgColor="#09090b" />
                            </div>
                        ) : (
                            <div className="w-[240px] h-[240px] bg-zinc-950 flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-850">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-zinc-500 text-xs">Cargando código QR...</span>
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-zinc-300 mt-6 flex items-center gap-1.5 justify-center">
                            ESCANEA EL QR <ArrowUpRight className="w-4 h-4 text-primary" />
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1 max-w-[280px]">
                            Abre la app, escanea el código en tu móvil y confirma tu asistencia.
                        </p>
                    </div>
                </div>

                {/* RIGHT: RECENTLY PRESENT ATHLETES */}
                <div className="lg:col-span-7 h-[420px] flex flex-col">
                    <div className="bg-zinc-900/35 border border-zinc-900/80 rounded-3xl p-6 md:p-8 flex flex-col h-full relative">
                        <h3 className="text-lg font-bold text-zinc-400 tracking-wider mb-4 uppercase">
                            ÚLTIMOS INGRESOS
                        </h3>

                        {attendances.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-650 text-center">
                                <Users className="w-16 h-16 opacity-15 mb-3" />
                                <p className="font-semibold text-lg">Aún no hay ingresos registrados</p>
                                <p className="text-sm text-zinc-600 max-w-[260px] mt-1">Los nombres de los atletas aparecerán aquí en vivo.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
                                {attendances.map((a, i) => (
                                    <div
                                        key={a.id}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${i === 0
                                            ? "bg-primary/10 border border-primary/20 text-zinc-100 shadow-[0_0_12px_rgba(212,175,55,0.08)]"
                                            : "bg-zinc-900/50 border border-zinc-900/90 text-zinc-350"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-primary animate-ping" : "bg-zinc-700"}`} />
                                            <span className={`font-semibold truncate ${i === 0 ? "text-primary text-lg" : "text-base"}`}>
                                                {a.athleteName}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs font-mono opacity-65">
                                                {new Date(a.checkInTime).toLocaleTimeString("es-ES", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit"
                                                })}
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] uppercase font-mono px-2 py-0.5 ${a.method === "QR_SCAN"
                                                ? "border-green-800 text-green-400 bg-green-950/20"
                                                : "border-zinc-800 text-zinc-400"
                                                }`}>
                                                {a.method === "QR_SCAN" ? "QR" : a.method}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* FOOTER / ADVICE */}
            <footer className="flex flex-col sm:flex-row items-center justify-between z-10 border-t border-zinc-900/70 pt-6">
                <div className="flex items-center gap-2 text-zinc-550 text-xs">
                    <HelpCircle className="w-4 h-4 text-zinc-650" />
                    <span>Presiona <span className="font-bold border border-zinc-800 px-1 rounded bg-zinc-900 text-zinc-400">F11</span> en tu teclado para el modo de pantalla completa en la TV.</span>
                </div>
                <div className="text-zinc-600 text-xs mt-2 sm:mt-0 font-medium">
                    RC FIGHT CLUB SYSTEM &copy; {new Date().getFullYear()}
                </div>
            </footer>

            {/* Custom inject CSS rule for slideDown animation keyframes */}
            <style jsx global>{`
                @keyframes slideDown {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 9999px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3f3f46;
                }
            `}</style>
        </div>
    );
}
