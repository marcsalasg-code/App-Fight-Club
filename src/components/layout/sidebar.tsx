"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Users,
    CreditCard,
    Calendar,
    Trophy,
    LayoutDashboard,
    Menu,
    Settings as SettingsIcon,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const mainNavigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, description: "Panel principal" },
    { name: "Calendario", href: "/calendario", icon: Calendar, description: "Ver clases y horarios" },
    { name: "Atletas", href: "/atletas", icon: Users, description: "Gestionar miembros" },
    { name: "Pagos", href: "/pagos", icon: CreditCard, description: "Facturación y suscripciones" },
];

const secondaryNavigation = [
    { name: "Reportes", href: "/reportes/asistencia", icon: FileText, description: "Exportar datos" },
    { name: "Competencias", href: "/competencias", icon: Trophy, description: "Eventos deportivos" },
    { name: "Configuración", href: "/configuracion", icon: SettingsIcon, description: "Ajustes del sistema" },
];

interface SidebarProps {
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, toggleCollapse }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-screen md:bg-sidebar md:border-r md:border-sidebar-border transition-all duration-300 ease-in-out",
                isCollapsed ? "md:w-20" : "md:w-64"
            )}
            aria-label="Menú lateral"
        >
            <div className="flex items-center gap-3 px-3 py-4 border-b border-sidebar-border h-16">
                <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                        src="/logo.png"
                        alt="RC Fight Club"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300">
                        <span className="font-bold text-sidebar-foreground">RC Fight Club</span>
                        <span className="text-xs text-sidebar-foreground/60">Gym Manager</span>
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation">
                <div className="space-y-1">
                    {mainNavigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={isCollapsed ? item.name : undefined}
                                className={cn(
                                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "h-6 w-6" : "")} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        )
                    })}
                </div>

                <div className="my-4 border-t border-sidebar-border" />

                <div className="space-y-1">
                    {!isCollapsed && (
                        <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                            Otros
                        </p>
                    )}
                    {secondaryNavigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={isCollapsed ? item.name : undefined}
                                className={cn(
                                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "h-6 w-6" : "")} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Footer / Toggle */}
            <div className="flex flex-col gap-2 p-3 border-t border-sidebar-border">
                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapse}
                    className={cn("w-full mb-2", isCollapsed ? "px-0" : "")}
                    title={isCollapsed ? "Expandir" : "Colapsar"}
                >
                    {isCollapsed ? <Menu className="h-4 w-4" /> : <div className="flex items-center gap-2 text-xs text-muted-foreground"><Menu className="h-3 w-3 rotate-90" /> Colapsar menú</div>}
                </Button>

                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                            <span className="text-white font-semibold text-sm">A</span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-sidebar-foreground truncate">Admin</span>
                            <span className="text-xs text-sidebar-foreground/60 truncate">Administrador</span>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
