"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, Loader2 } from "lucide-react";
import { voidPayment } from "@/app/(admin)/pagos/actions";
import { toast } from "sonner";

interface VoidPaymentButtonProps {
    paymentId: string;
    amount: number;
    athleteName: string;
    disabled?: boolean;
}

export function VoidPaymentButton({ paymentId, amount, athleteName, disabled }: VoidPaymentButtonProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVoid = async () => {
        setLoading(true);
        try {
            const result = await voidPayment(paymentId, reason || undefined);
            if (result.success) {
                toast.success("Pago anulado correctamente");
                setOpen(false);
            } else {
                toast.error(result.error || "Error al anular el pago");
            }
        } catch {
            toast.error("Error inesperado al anular el pago");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Anular pago"
                    disabled={disabled}
                >
                    <XCircle className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-destructive" />
                        Anular Pago
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                ¿Estás seguro de que deseas anular este pago de{" "}
                                <strong>€{amount.toFixed(2)}</strong> de{" "}
                                <strong>{athleteName}</strong>?
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Esta acción no se puede deshacer. La suscripción vinculada
                                también será cancelada.
                            </p>
                            <div className="pt-2">
                                <label htmlFor="void-reason" className="text-sm font-medium">
                                    Motivo (opcional)
                                </label>
                                <Textarea
                                    id="void-reason"
                                    placeholder="Ej: Error al registrar el monto"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleVoid}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Anulando...
                            </>
                        ) : (
                            "Anular Pago"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
