import { CalendarView } from "@/components/calendar/calendar-view";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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

async function getEvents() {
    return await prisma.competitionEvent.findMany({
        where: { status: { not: "CANCELLED" } },
        orderBy: { date: "asc" }
    });
}

export default async function CalendarPage() {
    const [classes, events] = await Promise.all([
        getClasses(),
        getEvents()
    ]);

    return (
        <CalendarView classes={classes} events={events} />
    );
}
