import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QrGenerator } from "@/components/checkin/qr-generator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ManualCheckIn } from "@/components/checkin/manual-checkin";

import { AttendanceList } from "@/components/checkin/attendance-list";

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

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendances = await prisma.attendance.findMany({
        where: {
            classId: id,
            date: {
                gte: today,
                lt: nextDay,
            },
        },
        include: {
            athlete: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="container py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/clases">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{gymClass.name}</h1>
                    <p className="text-muted-foreground">Modo Check-in</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left: Check-in Actions */}
                <div className="flex flex-col items-center gap-8 min-h-[50vh]">
                    <QrGenerator classId={gymClass.id} className={gymClass.name} />

                    <div className="w-full max-w-sm border-t pt-8">
                        <ManualCheckIn classId={gymClass.id} />
                    </div>
                </div>

                {/* Right: Live List */}
                <div className="bg-card border rounded-xl p-6 shadow-sm h-full max-h-[600px] overflow-hidden flex flex-col">
                    <AttendanceList attendances={attendances} />
                </div>
            </div>
        </div>
    );
}
