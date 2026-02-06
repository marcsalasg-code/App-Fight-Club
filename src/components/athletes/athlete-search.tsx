"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Phone, Search, Shield, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { searchAthletes } from "@/app/(admin)/atletas/actions";
import { useDebounce } from "@/hooks/use-debounce";

type AthleteResult = {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    initials: string;
    status: string;
    maskedPin?: string;
    // Membership indicators
    membershipColor?: "green" | "yellow" | "red";
    membershipLabel?: string;
    membershipName?: string | null;
    // Session indicators
    sessionsUsed?: number;
    sessionsLimit?: number | null;
    sessionsBadge?: string | null;
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

interface AthleteSearchPopoverProps {
    onSelect: (athlete: AthleteResult) => void;
    placeholder?: string;
    className?: string;
}

export function AthleteSearchPopover({
    onSelect,
    placeholder = "Buscar atleta...",
    className
}: AthleteSearchPopoverProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [athletes, setAthletes] = useState<AthleteResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedQuery = useDebounce(query, 300);

    // Fetch athletes when popover opens or query changes
    const fetchAthletes = useCallback(async (searchQuery: string) => {
        setLoading(true);
        try {
            const results = await searchAthletes(searchQuery);
            setAthletes(results as AthleteResult[]);
            setHasSearched(true);
        } catch (error) {
            console.error("Error fetching athletes:", error);
            setAthletes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on open (recent athletes)
    useEffect(() => {
        if (open && !hasSearched) {
            fetchAthletes("");
        }
    }, [open, hasSearched, fetchAthletes]);

    // Fetch on query change
    useEffect(() => {
        if (open && debouncedQuery !== undefined) {
            fetchAthletes(debouncedQuery);
        }
    }, [debouncedQuery, open, fetchAthletes]);

    // Reset when closed
    useEffect(() => {
        if (!open) {
            setQuery("");
            setHasSearched(false);
        }
    }, [open]);

    const handleSelect = (athlete: AthleteResult) => {
        onSelect(athlete);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-start h-auto py-3 px-4 font-normal",
                        className
                    )}
                >
                    <Search className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{placeholder}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                sideOffset={4}
            >
                {/* Search Input */}
                <div className="flex items-center border-b px-3 py-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                        placeholder="Escribe para buscar..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border-0 p-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoFocus
                    />
                    {query && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => setQuery("")}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Results */}
                <ScrollArea className="max-h-[320px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Buscando...
                        </div>
                    ) : athletes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-sm text-muted-foreground">
                            <Users className="h-8 w-8 mb-2 opacity-50" />
                            {query.length >= 2
                                ? "No se encontraron atletas"
                                : "No hay atletas registrados"}
                        </div>
                    ) : (
                        <div className="p-1">
                            {!query && athletes.length > 0 && (
                                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    Recientes
                                </p>
                            )}
                            {athletes.map((athlete) => (
                                <button
                                    key={athlete.id}
                                    type="button"
                                    onClick={() => handleSelect(athlete)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-2 py-2.5 rounded-md text-left",
                                        "hover:bg-accent focus:bg-accent focus:outline-none",
                                        "transition-colors cursor-pointer"
                                    )}
                                >
                                    {/* Color indicator */}
                                    <StatusDot color={athlete.membershipColor || "red"} />

                                    {/* Avatar with initials */}
                                    <Avatar className="h-9 w-9 border shrink-0">
                                        <AvatarFallback className={cn(
                                            "font-semibold text-sm",
                                            athlete.membershipColor === "green" && "text-green-700 bg-green-50",
                                            athlete.membershipColor === "yellow" && "text-yellow-700 bg-yellow-50",
                                            athlete.membershipColor === "red" && "text-muted-foreground bg-muted"
                                        )}>
                                            {athlete.initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Info */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium truncate">
                                                {athlete.fullName}
                                            </span>
                                            {/* Sessions badge */}
                                            {athlete.sessionsBadge && (
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "h-5 px-1.5 text-[10px] font-mono shrink-0",
                                                        athlete.sessionsUsed !== undefined &&
                                                        athlete.sessionsLimit != null &&
                                                        athlete.sessionsUsed >= athlete.sessionsLimit &&
                                                        "border-amber-500 text-amber-600"
                                                    )}
                                                >
                                                    {athlete.sessionsBadge}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            {/* Membership info */}
                                            <span className="truncate">
                                                {athlete.membershipName || athlete.membershipLabel || "Sin membresía"}
                                            </span>
                                            {athlete.membershipLabel && athlete.membershipLabel !== "Activo" && (
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "h-4 px-1 text-[9px] shrink-0",
                                                        athlete.membershipColor === "yellow" && "bg-yellow-100 text-yellow-700",
                                                        athlete.membershipColor === "red" && "bg-red-100 text-red-700"
                                                    )}
                                                >
                                                    {athlete.membershipLabel}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Secondary info */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mt-0.5">
                                            {athlete.maskedPin && (
                                                <span className="flex items-center gap-0.5">
                                                    <Shield className="h-2.5 w-2.5" />
                                                    {athlete.maskedPin}
                                                </span>
                                            )}
                                            {athlete.phone && (
                                                <span className="flex items-center gap-0.5">
                                                    <Phone className="h-2.5 w-2.5" />
                                                    ...{athlete.phone.slice(-4)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

// Keep the old AthleteSearch export for backwards compatibility
export { AthleteSearchPopover as AthleteSearch };
