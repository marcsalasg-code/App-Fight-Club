"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { registerPayment } from "../actions";
import { toast } from "sonner";
import { ReceiptScanner } from "./receipt-scanner";
import { ArrowLeft, Loader2, ScanLine } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type Athlete = {
    id: string;
    firstName: string;
    lastName: string;
};

type Membership = {
    id: string;
    name: string;
    price: number;
    durationDays: number | null;
    classCount: number | null;
};

type Props = {
    athletes: Athlete[];
    memberships: Membership[];
};

export function PaymentForm({ athletes, memberships }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedAthleteId = searchParams.get("athleteId");

    const [loading, setLoading] = useState(false);
    const [selectedMembership, setSelectedMembership] = useState<Membership | null>(
        null
    );
    const [currentDate] = useState(new Date());
    // OCR State
    const [scannedAmount, setScannedAmount] = useState<number | undefined>(undefined);
    const [scanDialogOpen, setScanDialogOpen] = useState(false);

    // Auto-fill logic
    const handleScanComplete = (data: { amount?: number; date?: string; text: string }) => {
        setScanDialogOpen(false);
        if (data.amount) {
            setScannedAmount(data.amount);
            toast.success(`Monto detectado: €${data.amount}`);

            // Try to find matching membership by price
            const match = memberships.find(m => Math.abs(m.price - data.amount!) < 0.1);
            if (match) {
                setSelectedMembership(match);
                toast.success(`Membresía sugerida: ${match.name}`);
            }
        } else {
            toast.warning("No se pudo detectar el monto automáticamente.");
        }
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        const result = await registerPayment({
            athleteId: formData.get("athleteId") as string,
            membershipId: formData.get("membershipId") as string,
            amount: parseFloat(formData.get("amount") as string),
            paymentMethod: formData.get("paymentMethod") as string,
            notes: formData.get("notes") as string,
        });

        setLoading(false);

        if (result.success) {
            toast.success("Pago registrado correctamente");
            router.push("/pagos");
        } else {
            toast.error(result.error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/pagos"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Registrar Pago</h1>
                        <p className="text-muted-foreground">
                            Registra un nuevo pago y suscripción
                        </p>
                    </div>
                </div>

                <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <ScanLine className="h-4 w-4" />
                            Escanear Recibo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                        <ReceiptScanner onScanComplete={handleScanComplete} />
                    </DialogContent>
                </Dialog>
            </div>

            <form action={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Pago</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="athleteId">Atleta *</Label>
                                <Select name="athleteId" required defaultValue={preSelectedAthleteId || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar atleta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {athletes.map((athlete) => (
                                            <SelectItem key={athlete.id} value={athlete.id}>
                                                {athlete.firstName} {athlete.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="membershipId">Tipo de Membresía *</Label>
                                <Select
                                    name="membershipId"
                                    required
                                    value={selectedMembership?.id}
                                    onValueChange={(value) => {
                                        const membership = memberships.find((m) => m.id === value);
                                        setSelectedMembership(membership || null);
                                        setScannedAmount(undefined); // Reset manual override if selecting membership
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar membresía" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {memberships.map((membership) => (
                                            <SelectItem key={membership.id} value={membership.id}>
                                                {membership.name} - €{membership.price}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Monto (€) *</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={selectedMembership ? selectedMembership.price : (scannedAmount || "")}
                                    onChange={(e) => setScannedAmount(parseFloat(e.target.value))}
                                    readOnly={!!selectedMembership}
                                    className={selectedMembership ? "bg-muted" : ""}
                                />
                                {selectedMembership && (
                                    <p className="text-xs text-muted-foreground">
                                        Precio de la membresía aplicado automáticamente
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Método de Pago *</Label>
                                <Select name="paymentMethod" required defaultValue="CASH">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Efectivo</SelectItem>
                                        <SelectItem value="CARD">Tarjeta</SelectItem>
                                        <SelectItem value="TRANSFER">Transferencia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Input
                                    id="notes"
                                    name="notes"
                                    placeholder="Notas adicionales..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedMembership ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-muted">
                                        <p className="font-medium">{selectedMembership.name}</p>
                                        <p className="text-2xl font-bold mt-2">
                                            €{selectedMembership.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Duración:</span>
                                            <span>
                                                {selectedMembership.durationDays
                                                    ? `${selectedMembership.durationDays} días`
                                                    : selectedMembership.classCount
                                                        ? `${selectedMembership.classCount} clases`
                                                        : "Sin límite"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Fecha inicio:</span>
                                            <span>{new Date().toLocaleDateString("es-ES")}</span>
                                        </div>
                                        {selectedMembership.durationDays && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Fecha fin:</span>
                                                <span>
                                                    {new Date(
                                                        currentDate.getTime() +
                                                        selectedMembership.durationDays * 24 * 60 * 60 * 1000
                                                    ).toLocaleDateString("es-ES")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    Selecciona una membresía para ver el resumen
                                </p>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.back()}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Registrar Pago
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
