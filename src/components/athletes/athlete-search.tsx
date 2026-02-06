"use client";

import { useEffect, useState, useRef } from "react";
import { Check, ChevronsUpDown, Loader2, Phone, Search, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
};

interface AthleteSearchProps {
    onSelect: (athlete: AthleteResult) => void;
    className?: string;
    placeholder?: string;
}

export function AthleteSearch({ onSelect, className, placeholder = "Buscar atleta..." }: AthleteSearchProps) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [athletes, setAthletes] = useState<AthleteResult[]>([]);

    // Use the custom hook
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        async function fetchAthletes() {
            if (debouncedQuery.length < 2) {
                setAthletes([]);
                return;
            }

            setLoading(true);
            try {
                const results = await searchAthletes(debouncedQuery);
                // Cast results to match AthleteResult if strictly typed, generally compatible
                setAthletes(results as unknown as AthleteResult[]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchAthletes();
    }, [debouncedQuery]);

    return (
        <div className={cn("relative w-full", className)}>
            <Command shouldFilter={false} className="rounded-lg border shadow-md overflow-hidden">
                <CommandInput
                    placeholder={placeholder}
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList className="max-h-[300px]">
                    {loading && (
                        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Buscando...
                        </div>
                    )}

                    {!loading && athletes.length === 0 && query.length >= 2 && (
                        <CommandEmpty className="p-4 text-center text-sm text-muted-foreground">
                            No se encontraron atletas.
                        </CommandEmpty>
                    )}

                    {!loading && athletes.length > 0 && (
                        <CommandGroup heading="Resultados">
                            {athletes.map((athlete) => (
                                <CommandItem
                                    key={athlete.id}
                                    value={athlete.id} // Use ID for uniqueness
                                    onSelect={() => {
                                        onSelect(athlete);
                                        setQuery("");
                                    }}
                                    className="cursor-pointer aria-selected:bg-accent"
                                    onMouseDown={(e) => e.preventDefault()} // Prevent blur focus issues
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarFallback className={cn(
                                                "font-semibold",
                                                athlete.status === "ACTIVE" ? "text-primary bg-primary/10" : "text-muted-foreground"
                                            )}>
                                                {athlete.initials}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{athlete.fullName}</span>
                                                {athlete.status === "INACTIVE" && (
                                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Inactivo</Badge>
                                                )}
                                                {athlete.status === "SUSPENDED" && (
                                                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Susp</Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                {athlete.maskedPin && (
                                                    <span className="flex items-center gap-1 bg-muted px-1.5 rounded-sm" title="PIN">
                                                        <Shield className="h-3 w-3" />
                                                        {athlete.maskedPin}
                                                    </span>
                                                )}
                                                {athlete.phone && (
                                                    <span className="flex items-center gap-1" title="Teléfono">
                                                        <Phone className="h-3 w-3" />
                                                        ...{athlete.phone.slice(-4)}
                                                    </span>
                                                )}
                                                {!athlete.maskedPin && !athlete.phone && (
                                                    <span>{athlete.email}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </div>
    );
}

// Separate component for Popover integration
export function AthleteSearchPopover({ onSelect }: { onSelect: (a: AthleteResult) => void }) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto py-3" // Taller button for better touch area
                >
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                        Buscar atleta...
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
                <AthleteSearch
                    onSelect={(a) => {
                        onSelect(a);
                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
