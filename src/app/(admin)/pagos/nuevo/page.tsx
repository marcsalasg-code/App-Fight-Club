import prisma from "@/lib/prisma";
import { PaymentForm } from "../components/payment-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getData(athleteId?: string) {
    const membershipPromise = prisma.membership.findMany({
        where: { active: true },
        orderBy: { price: "asc" },
    });

    const athletePromise = athleteId
        ? prisma.athlete.findUnique({
            where: { id: athleteId },
            select: { id: true, firstName: true, lastName: true },
        })
        : Promise.resolve(null);

    const [memberships, athlete] = await Promise.all([
        membershipPromise,
        athletePromise
    ]);

    return { memberships, athlete };
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewPaymentPage({ searchParams }: Props) {
    const params = await searchParams;
    const athleteId = typeof params.athleteId === 'string' ? params.athleteId : undefined;

    const { memberships, athlete } = await getData(athleteId);

    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <PaymentForm
                memberships={memberships}
                initialAthlete={athlete}
            />
        </Suspense>
    );
}
