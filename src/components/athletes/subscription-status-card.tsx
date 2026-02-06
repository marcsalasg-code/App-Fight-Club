"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SubscriptionStatusProps {
    hasSubscription: boolean;
    membershipName?: string;
    weeklyLimit?: number | null;
    weeklyUsed?: number;
    classLimit?: number | null;
    classesUsed?: number;
    endDate?: Date | null;
    status?: string;
}

export function SubscriptionStatusCard({
    hasSubscription,
    membershipName,
    weeklyLimit,
    weeklyUsed = 0,
    classLimit,
    classesUsed = 0,
    endDate,
}: SubscriptionStatusProps) {
    if (!hasSubscription) {
        return (
            <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Sin suscripción activa</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const weeklyProgress = weeklyLimit ? (weeklyUsed / weeklyLimit) * 100 : 0;
    const totalProgress = classLimit ? (classesUsed / classLimit) * 100 : 0;
    const isWeeklyLimitReached = weeklyLimit && weeklyUsed >= weeklyLimit;

    // Expiration logic
    const daysRemaining = endDate ? Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 5 && daysRemaining > 0;
    const isExpired = daysRemaining !== null && daysRemaining <= 0;

    return (
        <Card className={isExpired ? "border-destructive/30" : ""}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-primary" />
                        Estado de Membresía
                    </div>
                    {status === "ACTIVE" && (
                        <Badge variant={isExpiringSoon ? "secondary" : "default"} className={isExpiringSoon ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}>
                            {isExpiringSoon ? "Por Vencer" : "Activa"}
                        </Badge>
                    )}
                    {status === "EXPIRED" && <Badge variant="destructive">Vencida</Badge>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{membershipName}</span>
                    {endDate && (
                        <div className="text-right">
                            <p className={`text-xs font-medium ${isExpiringSoon ? "text-yellow-600" : isExpired ? "text-destructive" : "text-muted-foreground"}`}>
                                {isExpired ? "Venció el: " : "Vence el: "}
                                {new Date(endDate).toLocaleDateString("es-ES")}
                            </p>
                            {daysRemaining !== null && !isExpired && (
                                <p className="text-[10px] text-muted-foreground">
                                    ({daysRemaining} días restantes)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Weekly Usage */}
                {weeklyLimit && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Esta semana</span>
                            <span className={isWeeklyLimitReached ? "text-destructive font-medium" : ""}>
                                {weeklyUsed} / {weeklyLimit} clases
                            </span>
                        </div>
                        <Progress
                            value={weeklyProgress}
                            className={isWeeklyLimitReached ? "[&>div]:bg-destructive" : ""}
                        />
                        {isWeeklyLimitReached && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Límite semanal alcanzado
                            </p>
                        )}
                    </div>
                )}

                {/* Total Class Usage (for class-based memberships) */}
                {classLimit && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Clases totales</span>
                            <span>{classesUsed} / {classLimit}</span>
                        </div>
                        <Progress value={totalProgress} />
                    </div>
                )}

                {/* Unlimited indicator */}
                {!weeklyLimit && !classLimit && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Acceso ilimitado
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
