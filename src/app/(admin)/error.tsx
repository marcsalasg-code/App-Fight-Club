"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin Error:", error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="w-full max-w-md border-destructive/50">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="bg-destructive/10 p-4 rounded-full">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">
                            Algo salió mal
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Ha ocurrido un error inesperado. Puedes intentar
                            recargar la página.
                        </p>
                    </div>
                    <Button onClick={reset} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reintentar
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
