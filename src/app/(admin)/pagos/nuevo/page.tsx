import prisma from "@/lib/prisma";
import { PaymentForm } from "../components/payment-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getData() {
    const [athletes, memberships] = await Promise.all([
        prisma.athlete.findMany({
            where: { status: "ACTIVE" },
            orderBy: { firstName: "asc" },
            select: { id: true, firstName: true, lastName: true },
        }),
        prisma.membership.findMany({
            where: { active: true },
            orderBy: { price: "asc" },
        }),
    ]);

    return { athletes, memberships };
}

export default async function NewPaymentPage() {
    const { athletes, memberships } = await getData();

    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <PaymentForm athletes={athletes} memberships={memberships} />
        </Suspense>
    );
}
