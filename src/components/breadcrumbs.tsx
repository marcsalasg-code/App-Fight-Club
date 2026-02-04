"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
    atletas: "Atletas",
    nuevo: "Nuevo",
    editar: "Editar",
    calendario: "Calendario",
    pagos: "Pagos",
    membresias: "Membresías",
    competencias: "Competencias",
    configuracion: "Configuración",
    entrenadores: "Entrenadores",
    clases: "Clases",
    nueva: "Nueva",
    checkin: "Check-in",
};

export function Breadcrumbs() {
    const pathname = usePathname();

    // Don't show breadcrumbs on home
    if (pathname === "/") return null;

    const segments = pathname.split("/").filter(Boolean);

    // Don't show if only one segment (top-level page)
    if (segments.length <= 1) return null;

    const breadcrumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        // Check if it's a dynamic segment (UUID or ID)
        const isDynamic = /^[0-9a-f-]{36}$|^\d+$/.test(segment);
        const label = isDynamic
            ? "Detalle"
            : routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return {
            href,
            label,
            isLast,
        };
    });

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
            <Link
                href="/"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                aria-label="Ir al inicio"
            >
                <Home className="h-4 w-4" aria-hidden="true" />
            </Link>

            {breadcrumbs.map((crumb) => (
                <div key={crumb.href} className="flex items-center gap-1">
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    {crumb.isLast ? (
                        <span className="text-foreground font-medium" aria-current="page">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}
