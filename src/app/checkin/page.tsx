"use client";

import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PinKeypad } from "@/components/checkin/pin-keypad";
import { QrScanner } from "@/components/checkin/qr-scanner";
import { performCheckInWithPin } from "@/app/actions/checkin";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Helper: Play Success Synth Chime
function playAudioSuccess() {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.1); // A5

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
    } catch (e) {
        console.warn("AudioContext block", e);
    }
}

// Helper: Play Error Synth Chime
function playAudioError() {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.setValueAtTime(146.83, now + 0.12); // D3

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {
        console.warn("AudioContext block", e);
    }
}

function CheckInContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<'idle' | 'input' | 'processing' | 'success' | 'error'>(() => {
        if (token) return 'input';
        return 'error';
    });
    const [message, setMessage] = useState(() => {
        if (!token) return "No se ha detectado ningún código de clase.";
        return "";
    });
    const [athleteName, setAthleteName] = useState("");

    const prevTokenRef = useRef<string | null>(null);

    useEffect(() => {
        if (token !== prevTokenRef.current) {
            prevTokenRef.current = token;

            setTimeout(() => {
                if (token) {
                    setStatus('input');
                    setMessage("");
                } else {
                    setStatus('error');
                    setMessage("No se ha detectado ningún código de clase.");
                }
            }, 0);
        }
    }, [token]);

    const resetToInput = useCallback(() => {
        setStatus('input');
        setPin('');
        setMessage('');
        setAthleteName('');
    }, []);

    // Auto-reset after success
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(resetToInput, 5000);
            return () => clearTimeout(timer);
        }
    }, [status, resetToInput]);

    const [pin, setPin] = useState('');

    const handlePinSubmit = async (pinValue: string) => {
        if (!token) return;

        setStatus('processing');
        try {
            const result = await performCheckInWithPin(pinValue, token);

            if (result.success) {
                setMessage(result.message || "Check-in exitoso");
                setAthleteName(result.athleteName || "");
                setStatus('success');
                playAudioSuccess();
            } else {
                setMessage(result.message || "Error al verificar PIN");
                setStatus('error');
                playAudioError();
            }
        } catch (e) {
            setMessage("Error de conexión");
            setStatus('error');
            playAudioError();
        }
    };

    const handleQrScan = (decodedText: string) => {
        // Strip out athlete-pin prefix if present
        const pinValue = decodedText.startsWith("athlete-pin:")
            ? decodedText.replace("athlete-pin:", "")
            : decodedText;
        handlePinSubmit(pinValue);
    };

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-zinc-100">
                <Card className="w-full max-w-md border-red-500/50 bg-red-950/20 backdrop-blur-md">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900 rounded-xl border border-zinc-800">
                        <AlertCircle className="h-16 w-16 text-red-500 mb-4 animate-pulse" />
                        <h2 className="text-xl font-bold text-red-400 mb-2">{message}</h2>
                        <p className="text-sm text-zinc-400 mb-6">Inténtalo de nuevo o habla con tu entrenador.</p>
                        <Button variant="outline" className="border-zinc-850 hover:bg-zinc-800" onClick={() => setStatus('input')}>Intentar de nuevo</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-zinc-100">
                <Card className="w-full max-w-md border-green-500/50 bg-green-950/20 backdrop-blur-md">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900 rounded-xl border border-zinc-800">
                        <div className="animate-bounce">
                            <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-green-400 mb-2">¡Bienvenido!</h2>
                        <p className="text-2xl text-green-300 font-semibold">{athleteName}</p>
                        <p className="text-sm text-zinc-450 mt-2">{message}</p>
                        <Button variant="outline" onClick={resetToInput} className="mt-8 border-zinc-850 bg-green-950/40 text-green-300 hover:bg-green-900/40 gap-2">
                            Siguiente atleta
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 md:p-8 space-y-6">
            <div className="text-center space-y-2 max-w-lg mb-4">
                <div className="relative w-14 h-14 mx-auto mb-2">
                    <Image src="/logo.png" alt="RC Fight Club" fill className="object-contain" priority />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Check-in Kiosco
                </h1>
                <p className="text-sm text-zinc-400">
                    Presenta tu código QR en la cámara o ingresa tu PIN numérico a continuación.
                </p>
            </div>

            {status === 'processing' ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Loader2 className="h-14 w-14 animate-spin text-primary" />
                    <p className="text-zinc-300 font-medium tracking-wide">Validando pase de asistencia...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl w-full bg-zinc-900/60 p-6 md:p-8 rounded-2xl border border-zinc-900 shadow-2xl">
                    {/* Teclado PIN */}
                    <div className="flex flex-col items-center space-y-4 border-b md:border-b-0 md:border-r border-zinc-850 pb-6 md:pb-0 md:pr-8">
                        <span className="text-sm font-semibold text-zinc-350 tracking-wider uppercase mb-1">
                            Ingreso por PIN
                        </span>
                        <PinKeypad
                            onComplete={handlePinSubmit}
                            onCancel={() => { }}
                            isLoading={false}
                        />
                    </div>

                    {/* Escáner Cámara */}
                    <div className="flex flex-col items-center space-y-4 pt-6 md:pt-0 md:pl-2">
                        <span className="text-sm font-semibold text-zinc-350 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                            <Scan className="w-4 h-4 text-primary animate-pulse" /> Escaneo Express QR
                        </span>
                        <QrScanner onScan={handleQrScan} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CheckInPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950 text-white"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CheckInContent />
        </Suspense>
    );
}
