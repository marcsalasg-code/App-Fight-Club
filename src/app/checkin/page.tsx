"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PinKeypad } from "@/components/checkin/pin-keypad";
import { performCheckInWithPin } from "@/app/actions/checkin";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        // Did the token actually change?
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

    const handlePinSubmit = async (pin: string) => {
        if (!token) return;

        setStatus('processing');
        try {
            const result = await performCheckInWithPin(pin, token);

            if (result.success) {
                setMessage(result.message || "Check-in exitoso");
                setAthleteName(result.athleteName || "");
                setStatus('success');
                // Removed auto-reset for personal device flow
            } else {
                setMessage(result.message || "Error al verificar PIN");
                setStatus('error');
            }
        } catch (e) {
            setMessage("Error de conexión");
            setStatus('error');
        }
    };

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-red-500/50 bg-red-500/10">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950 rounded-xl">
                        <AlertCircle className="h-16 w-16 text-red-600 mb-4" />
                        <h2 className="text-xl font-bold text-red-700 mb-2">{message}</h2>
                        <div className="bg-red-50 p-2 rounded text-xs text-left w-full overflow-hidden">
                            <p className="font-bold">Info de depuración:</p>
                            <p className="break-all">{typeof window !== 'undefined' ? window.location.href : ''}</p>
                            <p className="mt-1">Params: {searchParams.toString()}</p>
                        </div>
                        <Button variant="outline" onClick={() => setStatus('input')} className="mt-4">Intentar de nuevo</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-green-500/50 bg-green-500/10">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950 rounded-xl">
                        <CheckCircle2 className="h-20 w-20 text-green-600 mb-6" />
                        <h2 className="text-3xl font-bold text-green-700 mb-2">¡Bienvenido!</h2>
                        <p className="text-xl text-green-600 font-medium">{athleteName}</p>
                        <p className="text-sm text-green-600/80 mt-2">{message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Check-in</h1>
                <p className="text-muted-foreground">Introduce tu PIN personal</p>
            </div>

            {status === 'processing' ? (
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p>Verificando...</p>
                </div>
            ) : (
                <PinKeypad
                    onComplete={handlePinSubmit}
                    onCancel={() => { }}
                    isLoading={false}
                />
            )}
        </div>
    );
}

export default function CheckInPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CheckInContent />
        </Suspense>
    );
}
