"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw } from "lucide-react";

interface QrScannerProps {
    onScan: (decodedText: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const qrId = "reader-element";
        const config = { fps: 10, qrbox: { width: 220, height: 220 } };

        let html5Qrcode: Html5Qrcode;
        try {
            html5Qrcode = new Html5Qrcode(qrId);
            scannerRef.current = html5Qrcode;
        } catch (e) {
            console.error("Reader element error", e);
            return;
        }

        const startScanning = () => {
            html5Qrcode.start(
                { facingMode: "user" },
                config,
                (decodedText) => {
                    setScanResult(decodedText);
                    onScan(decodedText);
                    // Reset scanner result state after 2 seconds to allow next scans
                    setTimeout(() => setScanResult(null), 2000);
                },
                () => {
                    // Suppress verbose scanner exceptions
                }
            ).catch(() => {
                // Retry with environment camera if front camera fails
                html5Qrcode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        setScanResult(decodedText);
                        onScan(decodedText);
                        setTimeout(() => setScanResult(null), 2000);
                    },
                    () => { }
                ).catch((err) => {
                    setErrorMsg("No se pudo iniciar la cámara. Conéntala o aprueba los permisos.");
                    console.error("Camera start failed", err);
                });
            });
        };

        // Give a tiny timeout to ensure DOM is ready
        const timer = setTimeout(startScanning, 100);

        return () => {
            clearTimeout(timer);
            if (html5Qrcode && html5Qrcode.isScanning) {
                html5Qrcode.stop().catch((e) => console.error("Failed to stop scanner", e));
            }
        };
    }, [onScan]);

    const handleRetry = () => {
        setErrorMsg(null);
        window.location.reload();
    };

    return (
        <Card className="w-full max-w-sm mx-auto overflow-hidden border-border/80 shadow-lg relative bg-card/60 backdrop-blur-md">
            <CardContent className="p-0 relative flex flex-col items-center justify-center">
                <div
                    id="reader-element"
                    className="w-full aspect-square min-h-[280px] bg-zinc-950 overflow-hidden relative"
                />

                {/* Modern neon scanning reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[180px] h-[180px] border-2 border-primary/45 rounded-lg relative flex items-center justify-center">
                        {/* Glowing corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary rounded-tl" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary rounded-tr" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary rounded-bl" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary rounded-br" />

                        {/* Red beam line */}
                        <div className="absolute w-[90%] h-0.5 bg-primary/80 shadow-[0_0_8px_rgba(212,175,55,1)] animate-[pulse_1.5s_infinite]" />
                    </div>
                </div>

                {errorMsg && (
                    <div className="absolute inset-0 bg-background/95 p-4 flex flex-col items-center justify-center text-center">
                        <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-destructive mb-3">{errorMsg}</p>
                        <button
                            onClick={handleRetry}
                            className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/95 transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reintentar
                        </button>
                    </div>
                )}

                {scanResult && (
                    <div className="absolute bottom-4 left-4 right-4 bg-green-500/90 text-white font-medium py-2 px-3 rounded-lg text-center shadow-lg backdrop-blur-sm animate-bounce text-sm">
                        ¡Código detectado! Procesando...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
