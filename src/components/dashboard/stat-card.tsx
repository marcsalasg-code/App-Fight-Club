"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { LucideIcon } from "lucide-react";

type Props = {
    title: string;
    value: number;
    subtitle?: string;
    icon: LucideIcon;
    iconClassName?: string;
    href?: string;
};

export function StatCard({ title, value, subtitle, icon: Icon, iconClassName }: Props) {
    return (
        <Card className="premium-card hover-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-primary/20 bg-primary/10 shadow-[0_0_8px_rgba(212,175,55,0.1)]`}>
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
            </CardHeader>
            <CardContent>
                <AnimatedCounter value={value} className="text-4xl font-bold" />
                {subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}
