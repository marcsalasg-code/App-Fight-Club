import { CalendarView } from "@/components/calendar/calendar-view";
import prisma from "@/lib/prisma";

async function getClasses() {
    return await prisma.class.findMany({
        where: { active: true },
        include: {
            _count: {
                select: { attendances: true }
            }
        }
    });
}

export default async function CalendarPage() {
    const classes = await getClasses();

    return (
        <CalendarView classes={classes} />
    );
}
