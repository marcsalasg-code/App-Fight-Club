import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, Users } from "lucide-react";
import { NewCompetitionModal } from "./new-competition-modal";
import { NewEventModal } from "./new-event-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function CompetitionsPage() {
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
            <p className="text-sm text-gray-500">If you see this, the page is loading. Check the blocks below for errors.</p>

            <div className="grid gap-4">

                <div className="p-4 border rounded bg-slate-900 text-white">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-lg">Competitions Fetch Result</h2>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {'error' in (competitionsResult as any) ? 'ERROR' : Array.isArray(competitionsResult) ? `OK (${competitionsResult.length})` : 'UNKNOWN'}
                        </span>
                    </div>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-60">
                        {JSON.stringify(competitionsResult, null, 2)}
                    </pre>
                </div>

                <div className="p-4 border rounded bg-slate-900 text-white">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-lg">Events Fetch Result</h2>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {'error' in (eventsResult as any) ? 'ERROR' : Array.isArray(eventsResult) ? `OK (${eventsResult.length})` : 'UNKNOWN'}
                        </span>
                    </div>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-60">
                        {JSON.stringify(eventsResult, null, 2)}
                    </pre>
                </div>

                <div className="p-4 border rounded bg-slate-900 text-white">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-lg">Stats Fetch Result</h2>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {'error' in (statsResult as any) ? 'ERROR' : 'OK'}
                        </span>
                    </div>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-60">
                        {JSON.stringify(statsResult, null, 2)}
                    </pre>
                </div>

            </div>
        </div>
    );
}
