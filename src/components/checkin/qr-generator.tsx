"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { generateClassQrPayload } from "@/app/actions/checkin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export interface QrGeneratorProps {
    classId: string;
    className?: string;
    size?: number;
}

export function QrGenerator({ classId, className, size = 256 }: QrGeneratorProps) {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchToken = async () => {
            try {
                const newToken = await generateClassQrPayload(classId);
                // Use configured host URL (for mobile access) or fallback to current origin
                const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || window.location.origin;
                const url = `${baseUrl}/checkin?token=${newToken}`;
                setToken(url);
                setError(null);
            } catch (err) {
                console.error("Error generating QR:", err);
                setError("Error al generar el código QR");
            }
        };

        // Initial fetch
        fetchToken();

        // Refresh every 25 seconds (token expires in 60s)
        const intervalId = setInterval(fetchToken, 25000);

        return () => clearInterval(intervalId);
    }, [classId]);

    return (
        <Card className="w-full max-w-md mx-auto text-center border-2 border-primary/20 shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">
                    {className ? `Check-in: ${className}` : "Check-in"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Escanea este código para registrar tu asistencia</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                {error ? (
                    <div className="text-red-500">{error}</div>
                ) : token ? (
                    <div className="p-4 bg-white rounded-xl">
                        <QRCode value={token} size={size} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Generando código seguro...</p>
                    </div>
                )}
                <p className="mt-6 text-xs text-muted-foreground animate-pulse">
                    El código se actualiza automáticamente cada 25 segundos
                </p>

                <div className="mt-4 p-2 bg-muted rounded text-[10px] break-all max-w-[250px] text-center border">
                    <p className="font-bold mb-1">Debug URL:</p>
                    {token}
                </div>
            </CardContent>
        </Card>
    );
}
