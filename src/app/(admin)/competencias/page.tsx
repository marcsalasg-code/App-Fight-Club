import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, Users } from "lucide-react";
import { NewCompetitionModal } from "./new-competition-modal";
import { NewEventModal } from "./new-event-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

// Safe fetchers that don't throw
const fetchCompetitions = async () => {
    try {
        return await prisma.competition.findMany({
            orderBy: { date: "desc" },
            include: { athlete: { select: { firstName: true, lastName: true } } },
        });
    } catch (e: any) {
        return { error: e.message || "Unknown Error fetching competitions" };
    }
};

const fetchEvents = async () => {
    try {
        return await prisma.competitionEvent.findMany({
            orderBy: { date: "desc" },
            include: { _count: { select: { competitions: true } } }
        });
    } catch (e: any) {
        return { error: e.message || "Unknown Error fetching events" };
    }
};

const fetchStats = async () => {
    try {
        const [total, wins, competitors] = await Promise.all([
            prisma.competition.count(),
            prisma.competition.count({ where: { result: "WON" } }),
            prisma.athlete.count({ where: { isCompetitor: true } }),
        ]);
        return { total, wins, competitors };
    } catch (e: any) {
        return { error: e.message || "Unknown Error fetching stats" };
    }
};

const [competitionsResult, eventsResult, statsResult] = await Promise.all([
    fetchCompetitions(),
    fetchEvents(),
    fetchStats(),
]);

return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-red-500">Diagnostic Mode</h1>
        <div className="grid gap-4">

            <div className="p-4 border rounded bg-slate-900 text-white">
                <h2 className="font-bold text-lg mb-2">Competitions Fetch Result</h2>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(competitionsResult, null, 2)}
                </pre>
            </div>

            <div className="p-4 border rounded bg-slate-900 text-white">
                <h2 className="font-bold text-lg mb-2">Events Fetch Result</h2>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(eventsResult, null, 2)}
                </pre>
            </div>

            <div className="p-4 border rounded bg-slate-900 text-white">
                <h2 className="font-bold text-lg mb-2">Stats Fetch Result</h2>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(statsResult, null, 2)}
                </pre>
            </div>

        </div>
    </div>
);
}

// Dummy export to keep file valid if I removed the original
export function dummy() { }
}
