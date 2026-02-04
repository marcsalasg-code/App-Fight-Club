"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Loader2, ScanLine } from "lucide-react";
import Tesseract from "tesseract.js";

interface ReceiptScannerProps {
    onScanComplete: (data: { amount?: number; date?: string; text: string }) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [processing, setProcessing] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsScanning(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("No se pudo acceder a la cámara.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setIsScanning(false);
    };

    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setProcessing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL("image/png");

            try {
                const result = await Tesseract.recognize(imageUrl, 'spa', {
                    logger: m => console.log(m)
                });

                const text = result.data.text;
                console.log("OCR Result:", text);

                // Basic regex extraction
                const amountMatch = text.match(/[\d,]+\.\d{2}|[\d,]+,\d{2}/);
                const amount = amountMatch
                    ? parseFloat(amountMatch[0].replace(',', '.'))
                    : undefined;

                // Date extraction (DD/MM/YYYY or DD-MM-YYYY)
                const dateMatch = text.match(/\d{2}[/-]\d{2}[/-]\d{4}/);
                const date = dateMatch ? dateMatch[0] : undefined;

                onScanComplete({ amount, date, text });
                stopCamera();
            } catch (err) {
                console.error("OCR Error:", err);
                alert("Error al procesar la imagen.");
            } finally {
                setProcessing(false);
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-muted/50">
            {!isScanning ? (
                <Button onClick={startCamera} variant="secondary" className="w-full gap-2 py-8">
                    <Camera className="h-6 w-6" />
                    Escanear Recibo
                </Button>
            ) : (
                <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4">
                        <Button
                            onClick={captureAndProcess}
                            disabled={processing}
                            size="lg"
                            className="rounded-full h-16 w-16 p-0 bg-white hover:bg-white/90 text-black border-4 border-primary"
                        >
                            {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <ScanLine className="h-6 w-6" />}
                        </Button>

                        <Button
                            onClick={stopCamera}
                            variant="destructive"
                            size="icon"
                            className="absolute right-4 bottom-2 rounded-full"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    {processing && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                            <Loader2 className="h-10 w-10 animate-spin mb-2" />
                            <p className="font-medium animate-pulse">Analizando recibo...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
