'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Competitions Page Error:', error);
    }, [error]);

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-xl mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al cargar competencias</AlertTitle>
                <AlertDescription className="mt-2">
                    <p className="font-mono text-xs bg-black/10 p-2 rounded mb-2">
                        {error.message || "Error desconocido"}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground">
                            Digest: {error.digest}
                        </p>
                    )}
                </AlertDescription>
            </Alert>
            <Button
                variant="outline"
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Intentar de nuevo
            </Button>
        </div>
    );
}
