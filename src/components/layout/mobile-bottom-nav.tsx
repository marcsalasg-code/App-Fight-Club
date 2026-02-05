"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Users,
    CreditCard,
    MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Inicio", href: "/", icon: LayoutDashboard },
    { name: "Calendario", href: "/calendario", icon: Calendar },
    { name: "Atletas", href: "/atletas", icon: Users },
    { name: "Pagos", href: "/pagos", icon: CreditCard },
    { name: "Más", href: "/configuracion", icon: MoreHorizontal },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t md:hidden"
            role="navigation"
            aria-label="Navegación principal móvil"
        >
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-label={item.name}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <div className={cn(
                                "relative flex items-center justify-center w-6 h-6",
                                isActive && "after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                            )}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <span className="text-[10px] font-medium leading-none">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Safe area for devices with home indicator */}
            <div className="h-safe-area-inset-bottom bg-background" />
        </nav>
    );
}
