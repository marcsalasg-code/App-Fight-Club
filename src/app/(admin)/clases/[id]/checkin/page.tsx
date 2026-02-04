import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QrGenerator } from "@/components/checkin/qr-generator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

            <div className="flex justify-center items-center min-h-[50vh]">
                <QrGenerator classId={gymClass.id} className={gymClass.name} />
            </div>
        </div>
    );
}
