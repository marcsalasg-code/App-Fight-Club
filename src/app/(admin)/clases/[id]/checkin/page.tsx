import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QrGenerator } from "@/components/checkin/qr-generator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { ManualCheckIn } from "@/components/checkin/manual-checkin";
import { AttendanceList } from "@/components/checkin/attendance-list";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClassCheckInPage({ params }: PageProps) {
    const { id } = await params;

    const gymClass = await prisma.class.findUnique({
        where: { id },
    });

    if (!gymClass) {
        notFound();
    }

    // Calculate week boundaries for weekly attendance count
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get today's attendance with subscription and weekly count
    const attendances = await prisma.attendance.findMany({
        where: {
            classId: id,
            date: { gte: today, lt: nextDay },
        },
        include: {
            athlete: {
                include: {
                    subscriptions: {
                        where: { status: "ACTIVE" },
                        take: 1,
                        include: { membership: true }
                    }
                }
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Get weekly attendance counts for each athlete
    const athleteIds = attendances.map(a => a.athleteId);
    const weeklyAttendanceCounts = await prisma.attendance.groupBy({
        by: ['athleteId'],
        where: {
            athleteId: { in: athleteIds },
            date: { gte: weekStart, lte: weekEnd }
        },
        _count: { id: true }
    });

    const weeklyCountMap = new Map(
        weeklyAttendanceCounts.map(w => [w.athleteId, w._count.id])
    );

    // Transform attendances for the component
    const transformedAttendances = attendances.map(a => ({
        id: a.id,
        method: a.method,
        createdAt: a.createdAt,
        athlete: {
            id: a.athlete.id,
            firstName: a.athlete.firstName,
            lastName: a.athlete.lastName,
        },
        subscription: a.athlete.subscriptions[0] ? {
            status: a.athlete.subscriptions[0].status,
            endDate: a.athlete.subscriptions[0].endDate,
            membership: {
                weeklyLimit: a.athlete.subscriptions[0].membership.weeklyLimit
            }
        } : null,
        weeklyAttendances: weeklyCountMap.get(a.athleteId) || 0
    }));

    return (
        <div className="container py-6 space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/clases">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{gymClass.name}</h1>
                        <p className="text-sm text-muted-foreground">Modo Check-in</p>
                    </div>
                </div>
                <Badge variant="outline" className="text-sm font-mono">
                    {attendances.length}/{gymClass.maxCapacity}
                </Badge>
            </div>

            {/* Main content - stacked layout */}
            <div className="space-y-6">
                {/* Search - Full width, prominent */}
                <div className="bg-card border rounded-xl p-4 shadow-sm">
                    <ManualCheckIn classId={gymClass.id} />
                </div>

                {/* Attendance List */}
                <div className="bg-card border rounded-xl p-6 shadow-sm min-h-[300px]">
                    <AttendanceList
                        attendances={transformedAttendances}
                        maxCapacity={gymClass.maxCapacity}
                    />
                </div>

                {/* QR Code - Collapsible */}
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full gap-2">
                            <ChevronDown className="h-4 w-4" />
                            Mostrar código QR
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                        <div className="bg-card border rounded-xl p-6 shadow-sm flex justify-center">
                            <QrGenerator classId={gymClass.id} className={gymClass.name} />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    );
}
