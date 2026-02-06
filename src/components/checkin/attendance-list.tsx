"use client";

import { Trash2, QrCode, UserPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { removeAttendance } from "@/app/(admin)/clases/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type AttendanceItem = {
    id: string;
    method: string;
    createdAt: Date;
    athlete: {
        id: string;
        firstName: string;
        lastName: string;
    };
    // Membership info (optional, fetched separately)
    subscription?: {
        status: string;
        endDate: Date | null;
        membership: {
            weeklyLimit: number | null;
        };
    } | null;
    weeklyAttendances?: number;
};

// Color indicator dot component
function StatusDot({ color }: { color: "green" | "yellow" | "red" }) {
    return (
        <span className={cn(
            "h-2.5 w-2.5 rounded-full shrink-0",
            color === "green" && "bg-green-500",
            color === "yellow" && "bg-yellow-500",
            color === "red" && "bg-red-500"
        )} />
    );
}

function getSubscriptionColor(subscription: AttendanceItem["subscription"]): "green" | "yellow" | "red" {
    if (!subscription || subscription.status !== "ACTIVE") return "red";

    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    if (!endDate) return "green";

    const now = new Date();
    const daysSinceExpiry = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceExpiry < 0) return "green";
    if (daysSinceExpiry <= 5) return "yellow";
    return "red";
}

export function AttendanceList({ attendances, maxCapacity }: {
    attendances: AttendanceItem[],
    maxCapacity?: number
}) {
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
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                <Clock className="h-10 w-10 mb-3 opacity-30" />
                <p className="font-medium">No hay asistencias hoy</p>
                <p className="text-xs mt-1">Usa la búsqueda arriba para registrar atletas</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header with count and capacity */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">
                    Asistentes de Hoy
                </h3>
                <Badge variant="outline" className="font-mono text-xs">
                    {attendances.length}{maxCapacity ? `/${maxCapacity}` : ""}
                </Badge>
            </div>

            {/* Capacity progress bar */}
            {maxCapacity && (
                <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all",
                            attendances.length >= maxCapacity ? "bg-amber-500" : "bg-primary"
                        )}
                        style={{ width: `${Math.min(100, (attendances.length / maxCapacity) * 100)}%` }}
                    />
                </div>
            )}

            {/* Scrollable list */}
            <ScrollArea className="flex-1 -mx-1 px-1">
                <div className="space-y-2">
                    {attendances.map((record) => {
                        const color = getSubscriptionColor(record.subscription);
                        const weeklyLimit = record.subscription?.membership.weeklyLimit;
                        const sessionsBadge = weeklyLimit
                            ? `${record.weeklyAttendances || 0}/${weeklyLimit}`
                            : null;

                        return (
                            <div
                                key={record.id}
                                className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border text-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <StatusDot color={color} />
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {record.athlete.firstName[0]}{record.athlete.lastName[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {record.athlete.firstName} {record.athlete.lastName}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {new Date(record.createdAt).toLocaleTimeString("es-ES", {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </span>
                                            {sessionsBadge && (
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "h-4 px-1 text-[9px] font-mono",
                                                        record.weeklyAttendances && weeklyLimit &&
                                                        record.weeklyAttendances >= weeklyLimit &&
                                                        "border-amber-500 text-amber-600"
                                                    )}
                                                >
                                                    {sessionsBadge}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Method badge */}
                                    <Badge
                                        variant="secondary"
                                        className="h-5 px-1.5 text-[10px] gap-0.5"
                                    >
                                        {record.method === "QR" ? (
                                            <><QrCode className="h-2.5 w-2.5" /> QR</>
                                        ) : (
                                            <><UserPlus className="h-2.5 w-2.5" /> Manual</>
                                        )}
                                    </Badge>

                                    {/* Delete button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(record.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
