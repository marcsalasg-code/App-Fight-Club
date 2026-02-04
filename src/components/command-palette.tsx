"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    LayoutDashboard,
    Calendar,
    Users,
    CreditCard,
    Trophy,
    Settings,
    UserPlus,
    PlusCircle,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CommandItem = {
    id: string;
    name: string;
    shortcut?: string;
    icon: React.ElementType;
    action: () => void;
    category: string;
};

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();

    const commands: CommandItem[] = [
        // Navigation
        { id: "nav-dashboard", name: "Ir al Dashboard", icon: LayoutDashboard, action: () => router.push("/"), category: "Navegación" },
        { id: "nav-calendar", name: "Ir al Calendario", icon: Calendar, action: () => router.push("/calendario"), category: "Navegación" },
        { id: "nav-athletes", name: "Ir a Atletas", icon: Users, action: () => router.push("/atletas"), category: "Navegación" },
        { id: "nav-payments", name: "Ir a Pagos", icon: CreditCard, action: () => router.push("/pagos"), category: "Navegación" },
        { id: "nav-competitions", name: "Ir a Competencias", icon: Trophy, action: () => router.push("/competencias"), category: "Navegación" },
        { id: "nav-settings", name: "Ir a Configuración", icon: Settings, action: () => router.push("/configuracion"), category: "Navegación" },
        // Actions
        { id: "act-new-athlete", name: "Nuevo Atleta", shortcut: "N A", icon: UserPlus, action: () => router.push("/atletas/nuevo"), category: "Acciones" },
        { id: "act-new-payment", name: "Registrar Pago", shortcut: "N P", icon: PlusCircle, action: () => router.push("/pagos/nuevo"), category: "Acciones" },
        { id: "act-new-class", name: "Nueva Clase", shortcut: "N C", icon: Calendar, action: () => router.push("/clases/nueva"), category: "Acciones" },
    ];

    const filteredCommands = query === ""
        ? commands
        : commands.filter((cmd) =>
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            cmd.category.toLowerCase().includes(query.toLowerCase())
        );

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    const flatFiltered = Object.values(groupedCommands).flat();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Open with Cmd+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            setOpen((prev) => !prev);
        }
    }, []);

    const handleDialogKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, flatFiltered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && flatFiltered[selectedIndex]) {
            e.preventDefault();
            flatFiltered[selectedIndex].action();
            setOpen(false);
            setQuery("");
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="sm:max-w-lg p-0 gap-0 overflow-hidden"
                onKeyDown={handleDialogKeyDown}
            >
                {/* Search Input */}
                <div className="flex items-center gap-2 border-b px-4 py-3">
                    <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <Input
                        placeholder="Buscar comandos..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
                        autoFocus
                        aria-label="Buscar comandos"
                    />
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        ESC
                    </kbd>
                </div>

                {/* Command List */}
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {Object.entries(groupedCommands).map(([category, items]) => (
                        <div key={category}>
                            <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                {category}
                            </p>
                            {items.map((cmd) => {
                                const index = flatFiltered.findIndex((c) => c.id === cmd.id);
                                const Icon = cmd.icon;
                                return (
                                    <button
                                        key={cmd.id}
                                        onClick={() => {
                                            cmd.action();
                                            setOpen(false);
                                            setQuery("");
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm transition-colors",
                                            index === selectedIndex
                                                ? "bg-accent text-accent-foreground"
                                                : "hover:bg-accent/50"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                        <span className="flex-1 text-left">{cmd.name}</span>
                                        {cmd.shortcut && (
                                            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                                {cmd.shortcut}
                                            </kbd>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}

                    {flatFiltered.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No se encontraron comandos
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">↑↓</kbd>
                        <span>para navegar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">↵</kbd>
                        <span>para seleccionar</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
