import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, Users } from "lucide-react";
import { NewCompetitionModal } from "./new-competition-modal";
import { NewEventModal } from "./new-event-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

async function getCompetitions() {
    console.log("Fetching Competitions...");
    try {
        const data = await prisma.competition.findMany({
            orderBy: { date: "desc" },
            include: {
                athlete: { select: { firstName: true, lastName: true } },
            },
        });
        console.log(`Competitions fetched: ${data.length}`);
        return data;
    } catch (e) {
        console.error("Error fetching competitions:", e);
        throw e;
    }
}

async function getEvents() {
    console.log("Fetching Events...");
    try {
        const data = await prisma.competitionEvent.findMany({
            orderBy: { date: "desc" },
            include: {
                _count: { select: { competitions: true } }
            }
        });
        console.log(`Events fetched: ${data.length}`);
        return data;
    } catch (e) {
        console.error("Error fetching events:", e);
        throw e;
    }
}

async function getStats() {
    console.log("Fetching Stats...");
    try {
        const [total, wins, competitors] = await Promise.all([
            prisma.competition.count(),
            prisma.competition.count({ where: { result: "WON" } }),
            prisma.athlete.count({ where: { isCompetitor: true } }),
        ]);
        console.log("Stats fetched");
        return { total, wins, competitors };
    } catch (e) {
        console.error("Error fetching stats:", e);
        throw e;
    }
}

const resultColors: Record<string, string> = {
    WON: "bg-green-500/10 text-green-700",
    LOST: "bg-red-500/10 text-red-700",
    DRAW: "bg-yellow-500/10 text-yellow-700",
    PENDING: "bg-gray-500/10 text-gray-700",
};

const resultLabels: Record<string, string> = {
    WON: "Victoria",
    LOST: "Derrota",
    DRAW: "Empate",
    PENDING: "Pendiente",
};

export default async function CompetitionsPage() {
    const [competitions, events, stats] = await Promise.all([
        getCompetitions(),
        getEvents(),
        getStats(),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Debug Mode</h1>
            <div className="grid gap-4">
                <div className="p-4 border rounded">
                    <h2 className="font-bold">Stats Data Type: {typeof stats}</h2>
                    <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(stats, null, 2)}</pre>
                </div>
                <div className="p-4 border rounded">
                    <h2 className="font-bold">Events Data Type: {Array.isArray(events) ? 'Array' : typeof events}</h2>
                    <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(events, null, 2)}</pre>
                </div>
                <div className="p-4 border rounded">
                    <h2 className="font-bold">Competitions Data Type: {Array.isArray(competitions) ? 'Array' : typeof competitions}</h2>
                    <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(competitions, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
