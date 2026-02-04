import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { AthleteForm } from "../../components/athlete-form";

export const dynamic = 'force-dynamic';

async function getData(id: string) {
    const athlete = await prisma.athlete.findUnique({
        where: { id },
        include: { tags: true }
    });
    const tags = await prisma.tag.findMany({ orderBy: { label: "asc" } });

    return { athlete, tags };
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditAthletePage({ params }: Props) {
    const { id } = await params;
    const { athlete, tags } = await getData(id);

    if (!athlete) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/atletas/${id}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Editar Atleta</h1>
                    <p className="text-muted-foreground">
                        {athlete.firstName} {athlete.lastName}
                    </p>
                </div>
            </div>

            <AthleteForm athlete={athlete} availableTags={tags} />
        </div>
    );
}
