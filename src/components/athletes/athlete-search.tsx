"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search, User } from "lucide-react";
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
import { searchAthletes } from "@/app/(admin)/atletas/actions";
import { useDebounce } from "@/hooks/use-debounce"; // Check if this hook exists, if not need to create or implement inline

type AthleteResult = {
    id: string;
    fullName: string;
    email: string | null;
    initials: string;
    status: string;
};

interface AthleteSearchProps {
    onSelect: (athlete: AthleteResult) => void;
    className?: string;
    placeholder?: string;
}

export function AthleteSearch({ onSelect, className, placeholder = "Buscar atleta..." }: AthleteSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [athletes, setAthletes] = useState<AthleteResult[]>([]);

    // Simple debounce implementation if hook doesn't exist
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        async function fetchAthletes() {
            if (debouncedQuery.length < 2) {
                setAthletes([]);
                return;
            }

            setLoading(true);
            try {
                const results = await searchAthletes(debouncedQuery);
                setAthletes(results);
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
            <Command shouldFilter={false} className="rounded-lg border shadow-md">
                <CommandInput
                    placeholder={placeholder}
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    {loading && (
                        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Buscando...
                        </div>
                    )}

                    {!loading && athletes.length === 0 && query.length >= 2 && (
                        <CommandEmpty>No se encontraron atletas.</CommandEmpty>
                    )}

                    {!loading && athletes.length > 0 && (
                        <CommandGroup heading="Resultados">
                            {athletes.map((athlete) => (
                                <CommandItem
                                    key={athlete.id}
                                    value={athlete.fullName} // Accessibility value
                                    onSelect={() => {
                                        onSelect(athlete);
                                        setQuery(""); // Clear or keep? Usually clear for next
                                        setOpen(false); // If used in popover
                                    }}
                                    className="cursor-pointer"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mr-3 text-xs">
                                        {athlete.initials}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{athlete.fullName}</span>
                                        {athlete.email && (
                                            <span className="text-xs text-muted-foreground">{athlete.email}</span>
                                        )}
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4 opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </div>
    );
}

// Separate component for Popover integration if needed
export function AthleteSearchPopover({ onSelect }: { onSelect: (a: AthleteResult) => void }) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                        Buscar atleta...
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
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
