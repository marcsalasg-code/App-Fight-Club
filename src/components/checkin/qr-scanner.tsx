"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";

interface QrScannerProps {
    onScan: (decodedText: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
    const [scanResult, setScanResult] = useState<string | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                scanner.clear();
                setScanResult(decodedText);
                onScan(decodedText);
            },
            () => {
                // console.warn(error);
            }
        );

        return () => {
            scanner.clear().catch((e) => console.error("Failed to clear scanner", e));
        };
    }, [onScan]);

    return (
        <Card className="w-full max-w-md mx-auto overflow-hidden">
            <CardContent className="p-0">
                <div id="reader" className="w-full h-full min-h-[300px] bg-black" />
                {scanResult && <p className="text-center p-2 text-green-600 font-bold">¡Código detectado!</p>}
            </CardContent>
        </Card>
    );
}
