"use client";

import { useState } from "react";
import { CheckCircle2, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { registerAttendance } from "@/app/(admin)/clases/actions";
import { AthleteSearchPopover } from "@/components/athletes/athlete-search";

import { useRouter } from "next/navigation";

interface ManualCheckInProps {
    classId: string;
}

export function ManualCheckIn({ classId }: ManualCheckInProps) {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(false);

    const handleSelect = async (athlete: { id: string; fullName: string }) => {
        setIsLoading(true);

        try {
            const result = await registerAttendance(classId, [athlete.id], { skipLimits: true });

            if (result.success) {
                toast.success(`Check-in exitoso: ${athlete.fullName}`, {
                    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                    duration: 3000,
                });
                router.refresh();
            } else {
                toast.error("Error en check-in", {
                    description: result.error || "No se pudo registrar la asistencia",
                    icon: <AlertCircle className="h-4 w-4 text-destructive" />,
                });
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto mt-8 p-6 bg-card rounded-xl border shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Check-in Manual</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                Busca y añade un atleta manualmente si no tiene su código.
            </p>

            <AthleteSearchPopover onSelect={handleSelect} />
        </div>
    );
}
