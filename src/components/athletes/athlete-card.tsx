"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Trophy } from "lucide-react";
import { getStatusColor, STATUS_LABELS } from "@/lib/status-colors";
import { cn } from "@/lib/utils";

type AthleteCardProps = {
    athlete: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        status: string; // This is now the Label (e.g. "Activo")
        statusColor: "green" | "yellow" | "red";
        sessionsBadge?: string | null;
        isOverLimit?: boolean;
        isCompetitor: boolean;
        _count?: { attendances: number };
        tags?: { id: string; name: string; color: string }[];
    };
};

export function AthleteCard({ athlete }: AthleteCardProps) {
    const initials = athlete.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const statusStyles = {
        green: "bg-green-500/10 text-green-700 border-green-200",
        yellow: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
        red: "bg-red-500/10 text-red-700 border-red-200",
    }[athlete.statusColor] || "bg-gray-100";

    return (
        <Link href={`/atletas/${athlete.id}`}>
            <Card className="hover:shadow-md transition-all hover:border-primary/30 active:scale-[0.98]">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        {/* Status Dot */}
                        <span className={cn(
                            "h-2.5 w-2.5 rounded-full shrink-0",
                            athlete.statusColor === "green" && "bg-green-500",
                            athlete.statusColor === "yellow" && "bg-yellow-500",
                            athlete.statusColor === "red" && "bg-red-500"
                        )} />

                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold truncate">{athlete.name}</p>
                                {athlete.isCompetitor && (
                                    <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="secondary" className={cn("text-[10px] px-1.5 h-4", statusStyles)}>
                                    {athlete.status}
                                </Badge>
                                {athlete.sessionsBadge && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] px-1.5 h-4 font-mono",
                                            athlete.isOverLimit && "border-amber-500 text-amber-600"
                                        )}
                                    >
                                        {athlete.sessionsBadge}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-50" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
