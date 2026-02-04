import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { MembershipDialog } from "../components/membership-dialog";
import { MembershipCard } from "../components/membership-card";

export const dynamic = 'force-dynamic';

async function getMemberships() {
    return prisma.membership.findMany({
        where: { active: true },
        orderBy: { price: "asc" },
    });
}

export default async function MembershipsPage() {
    const memberships = await getMemberships();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/pagos"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Membresías</h1>
                        <p className="text-muted-foreground">
                            Configura los tipos de membresía
                        </p>
                    </div>
                </div>
                <MembershipDialog />
            </div>

            {memberships.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            No hay membresías configuradas
                        </p>
                        <MembershipDialog />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {memberships.map((membership) => (
                        <MembershipCard key={membership.id} membership={membership} />
                    ))}
                </div>
            )}
        </div>
    );
}
