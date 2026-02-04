import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AthleteForm } from "../components/athlete-form";
import prisma from "@/lib/prisma";

export default async function NewAthletePage() {
    const tags = await prisma.tag.findMany({ orderBy: { label: "asc" } });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/atletas"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Nuevo Atleta</h1>
                    <p className="text-muted-foreground">
                        Registra un nuevo miembro del gimnasio
                    </p>
                </div>
            </div>

            <AthleteForm availableTags={tags} />
        </div>
    );
}
