"use client";

import { Users } from "lucide-react";
import { Class, TYPE_COLORS } from "./types";

type Props = {
    cls: Class;
    onClick: (id: string) => void;
};

export function AgendaItem({ cls, onClick }: Props) {
    const colors = TYPE_COLORS[cls.type] || TYPE_COLORS.default;

    return (
        <div
            onClick={() => onClick(cls.id)}
            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors bg-card"
            style={{ borderLeftWidth: 4, borderLeftColor: colors.border }}
        >
            <div className="text-sm font-mono text-muted-foreground shrink-0 w-16">
                {cls.startTime}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{cls.name}</p>
                <p className="text-xs text-muted-foreground">
                    {cls.startTime} - {cls.endTime}
                </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <Users className="h-4 w-4" />
                <span>{cls._count.attendances}</span>
            </div>
        </div>
    );
}
