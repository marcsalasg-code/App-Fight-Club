"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, UserPlus, AlertCircle, Search, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { registerAttendance } from "@/app/(admin)/clases/actions";
import { searchAthletes } from "@/app/(admin)/atletas/actions";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ManualCheckInProps {
    classId: string;
}

type AthleteResult = {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    initials: string;
    status: string;
    membershipColor?: "green" | "yellow" | "red";
    membershipLabel?: string;
    membershipName?: string | null;
};

export function ManualCheckIn({ classId }: ManualCheckInProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AthleteResult[]>([]);
    const [checkingId, setCheckingId] = useState<string | null>(null);

    const debouncedQuery = useDebounce(query, 250);

    const performSearch = useCallback(async (searchQuery: string) => {
        setLoading(true);
        try {
            const data = await searchAthletes(searchQuery);
            setResults(data as AthleteResult[]);
        } catch (error) {
            console.error("Manual check-in search failed", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch initial list (active/recent athletes) on mount
    useEffect(() => {
        performSearch("");
    }, [performSearch]);

    // Update query search
    useEffect(() => {
        performSearch(debouncedQuery);
    }, [debouncedQuery, performSearch]);

    const handleCheckIn = async (athlete: AthleteResult) => {
        setCheckingId(athlete.id);
        try {
            const result = await registerAttendance(classId, [athlete.id], { skipLimits: true });

            if (result.success) {
                toast.success(`Check-in exitoso: ${athlete.fullName}`, {
                    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                    duration: 3000,
                });
                setQuery(""); // Clear search field
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
            setCheckingId(null);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-5 bg-card rounded-xl border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg text-foreground">Asistencia Manual Rápida</h3>
                </div>
            </div>

            {/* Inline search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar atleta por nombre o teléfono..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 h-11 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                    autoFocus
                />
            </div>

            {/* List Results */}
            <div className="border border-border/60 rounded-lg overflow-hidden bg-background/40">
                <ScrollArea className="h-[260px] w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground text-sm space-y-2">
                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                            <span>Buscando atletas...</span>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground text-sm p-4 text-center">
                            <User className="h-10 w-10 mb-2 opacity-25" />
                            <p className="font-medium">No se encontraron atletas</p>
                            <p className="text-xs text-muted-foreground/80 mt-1">Verifica la ortografía o registra uno nuevo.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40 p-1.5">
                            {results.map((athlete) => (
                                <div
                                    key={athlete.id}
                                    className="flex items-center justify-between py-2 px-3 hover:bg-zinc-100 hover:dark:bg-zinc-900 rounded-md transition-all group"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                                        <span className={cn(
                                            "h-2.5 w-2.5 rounded-full shrink-0",
                                            athlete.membershipColor === "green" && "bg-green-500",
                                            athlete.membershipColor === "yellow" && "bg-yellow-500",
                                            athlete.membershipColor === "red" && "bg-red-500",
                                            !athlete.membershipColor && "bg-zinc-350"
                                        )} />

                                        <Avatar className="h-8 w-8 border shrink-0">
                                            <AvatarFallback className="font-semibold text-xs bg-muted">
                                                {athlete.initials || `${athlete.firstName[0]}${athlete.lastName[0]}`}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-sm text-foreground truncate">
                                                {athlete.fullName || `${athlete.firstName} ${athlete.lastName}`}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {athlete.membershipName || "Sin membresía activa"}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={checkingId !== null}
                                        onClick={() => handleCheckIn(athlete)}
                                        className={cn(
                                            "h-8 px-3 text-xs border-zinc-250 dark:border-zinc-800 hover:bg-primary hover:text-primary-foreground transition-all shrink-0",
                                            checkingId === athlete.id && "bg-zinc-100"
                                        )}
                                    >
                                        {checkingId === athlete.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            "Registrar"
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
                Puntos de color indican el estado de membresía: Verde (Activa), Amarillo (Alerta), Rojo (Inactiva / Vencida).
            </p>
        </div>
    );
}
