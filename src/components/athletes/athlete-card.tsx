"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Trophy } from "lucide-react";
import { getStatusColor, STATUS_LABELS } from "@/lib/status-colors";

type AthleteCardProps = {
    athlete: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        status: string;
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

    return (
        <Link href={`/atletas/${athlete.id}`}>
            <Card className="hover:shadow-md transition-all hover:border-primary/30 active:scale-[0.98]">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
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
                            <p className="text-sm text-muted-foreground truncate">
                                {athlete.email || athlete.phone || "Sin contacto"}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <Badge
                                variant="outline"
                                className={getStatusColor(athlete.status)}
                            >
                                {STATUS_LABELS[athlete.status] || athlete.status}
                            </Badge>
                            {athlete._count && (
                                <span className="text-xs text-muted-foreground">
                                    {athlete._count.attendances} asist.
                                </span>
                            )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>

                    {/* Tags */}
                    {athlete.tags && athlete.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {athlete.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag.id}
                                    className="text-[10px] px-2 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: tag.color }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                            {athlete.tags.length > 3 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    +{athlete.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
