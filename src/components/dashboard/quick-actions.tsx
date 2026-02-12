"use client";

import Link from "next/link";
import { UserPlus, PlusCircle, CalendarCheck, CalendarPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickActionProps {
    href: string;
    icon: React.ElementType;
    label: string;
    description?: string;
    color?: string;
    delay?: number;
}

function QuickAction({ href, icon: Icon, label, description, color = "text-primary", delay = 0 }: QuickActionProps) {
    return (
        <Link href={href} className="group block h-full">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 hover:bg-muted/5">
                <CardContent className="p-4 flex flex-row items-center gap-4 h-full">
                    <div className={cn("p-2 rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20", color)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{label}</h3>
                        {description && <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <QuickAction
                href="/atletas/nuevo"
                icon={UserPlus}
                label="Nuevo Atleta"
                description="Registrar miembro"
                color="text-blue-500"
            />
            <QuickAction
                href="/pagos/nuevo"
                icon={PlusCircle}
                label="Registrar Pago"
                description="Ingreso o cuota"
                color="text-emerald-500"
            />
            <QuickAction
                href="/checkin" // Or a modal trigger if preferred, for now linking to checkin page
                icon={CalendarCheck}
                label="Check-in Rápido"
                description="Asistencia manual"
                color="text-amber-500"
            />
            <QuickAction
                href="/clases/nueva"
                icon={CalendarPlus}
                label="Crear Clase"
                description="Programar sesión"
                color="text-purple-500"
            />
        </div>
    );
}
