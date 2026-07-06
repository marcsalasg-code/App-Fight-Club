import { Users, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Class, TYPE_COLORS } from "./types";
import { getClassStatus } from "./utils";
import { cn } from "@/lib/utils";

type Props = {
    cls: Class;
    date: Date;
    onClick: (id: string) => void;
};

export function AgendaItem({ cls, date, onClick }: Props) {
    const colors = TYPE_COLORS[cls.type] || TYPE_COLORS.default;
    const status = getClassStatus(cls, date);

    const isCompleted = status === 'COMPLETED';
    const isPending = status === 'PENDING';
    const isInProgress = status === 'IN_PROGRESS';

    return (
        <div
            onClick={() => onClick(cls.id)}
            className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border border-black/5 dark:border-white/5 cursor-pointer transition-all bg-card active:scale-[0.98]",
                isCompleted ? "opacity-75" : "shadow-sm hover:shadow hover:bg-accent/40",
                isInProgress && "ring-1 ring-primary ring-offset-0 bg-primary/[0.02]"
            )}
            style={{ borderLeftWidth: 4, borderLeftColor: colors.border }}
        >
            {/* Time block */}
            <div className="flex flex-col shrink-0">
                <span className="text-sm font-bold font-mono tracking-tight text-foreground">
                    {cls.startTime}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                    {cls.endTime}
                </span>
            </div>

            {/* Info block */}
            <div className="flex-1 min-w-0 pl-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-semibold text-sm text-foreground truncate leading-tight">
                        {cls.name}
                    </p>
                    {isInProgress && (
                        <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 dark:text-green-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            En Curso
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${colors.border}15`, color: colors.border }}
                    >
                        {cls.type}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                        <Users className="h-3.5 w-3.5 opacity-70" />
                        <span className="font-mono">{cls._count.attendances}</span>
                    </span>
                </div>
            </div>

            {/* End Indicators */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
                {isCompleted && (
                    <span className="bg-emerald-500/10 p-1 rounded-full text-emerald-500">
                        <CheckCircle2 className="h-4 w-4" />
                    </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground/45 group-hover:text-foreground transition-colors" />
            </div>
        </div>
    );
}
