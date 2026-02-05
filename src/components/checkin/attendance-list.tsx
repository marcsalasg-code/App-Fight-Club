"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeAttendance } from "@/app/(admin)/clases/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AttendenceItem = {
    id: string;
    athlete: {
        firstName: string;
        lastName: string;
    };
    createdAt: Date;
};

export function AttendanceList({ attendances }: { attendances: AttendenceItem[] }) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        const result = await removeAttendance(id);
        if (result.success) {
            toast.success("Asistencia eliminada");
            router.refresh();
        } else {
            toast.error("Error al eliminar");
        }
    };

    if (attendances.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-8">
                No hay asistencias registradas hoy
            </div>
        );
    }

    return (
        <div className="space-y-2 mt-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">
                Asistentes ({attendances.length})
            </h3>
            <div className="space-y-2">
                {attendances.map((record) => (
                    <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border text-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {record.athlete.firstName[0]}{record.athlete.lastName[0]}
                            </div>
                            <span className="font-medium">
                                {record.athlete.firstName} {record.athlete.lastName}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(record.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
