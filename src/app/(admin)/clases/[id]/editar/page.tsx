import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditClassForm } from "./edit-class-form";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditClassPage({ params }: Props) {
    const { id } = await params;

    const classData = await prisma.class.findUnique({
        where: { id },
        include: {
            coaches: { select: { id: true, name: true } },
        },
    });

    if (!classData) {
        notFound();
    }

    return (
        <EditClassForm
            classData={{
                id: classData.id,
                name: classData.name,
                type: classData.type,
                dayOfWeek: classData.dayOfWeek,
                startTime: classData.startTime,
                endTime: classData.endTime,
                levelRequired: classData.levelRequired,
                maxCapacity: classData.maxCapacity,
                color: classData.color,
                coaches: classData.coaches,
            }}
        />
    );
}
