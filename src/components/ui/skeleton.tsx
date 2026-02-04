"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted",
                className
            )}
            aria-hidden="true"
        />
    );
}

export function CardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("rounded-xl border bg-card p-6", className)}>
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="border-b">
            <td className="p-4"><Skeleton className="h-4 w-32" /></td>
            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
            <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
            <td className="p-4"><Skeleton className="h-4 w-20" /></td>
            <td className="p-4"><Skeleton className="h-8 w-8 rounded" /></td>
        </tr>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-xl border bg-card">
            <div className="p-4 border-b">
                <Skeleton className="h-5 w-32" />
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left"><Skeleton className="h-4 w-20" /></th>
                        <th className="p-4 text-left"><Skeleton className="h-4 w-16" /></th>
                        <th className="p-4 text-left"><Skeleton className="h-4 w-12" /></th>
                        <th className="p-4 text-left"><Skeleton className="h-4 w-24" /></th>
                        <th className="p-4 text-left"><Skeleton className="h-4 w-16" /></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRowSkeleton key={i} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6" aria-label="Cargando dashboard..." role="status">
            {/* Alert skeleton */}
            <Skeleton className="h-14 w-full rounded-lg" />

            {/* Primary Stats - High Priority */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>

            {/* Secondary Stats - Info */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>

            {/* Today's classes */}
            <div className="rounded-xl border bg-card p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function AthleteDetailSkeleton() {
    return (
        <div className="space-y-6" aria-label="Cargando atleta..." role="status">
            <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    );
}

export function ClassCardSkeleton() {
    return (
        <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
        </div>
    );
}
