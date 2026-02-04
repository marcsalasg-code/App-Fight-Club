
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting DB Verification for Competitions...");

    try {
        // 1. Fetch Events
        console.log("Fetching Events...");
        const events = await prisma.competitionEvent.findMany({
            orderBy: { date: "desc" },
            include: {
                _count: { select: { competitions: true } }
            }
        });
        console.log(`✅ Events fetched: ${events.length}`);

        // 2. Fetch Competitions
        console.log("Fetching Competitions...");
        const competitions = await prisma.competition.findMany({
            orderBy: { date: "desc" },
            include: {
                athlete: { select: { firstName: true, lastName: true } },
            },
        });
        console.log(`✅ Competitions fetched: ${competitions.length}`);

        // 3. Status Check
        console.log("Db connection is healthy and schema appears correct.");

    } catch (e) {
        console.error("❌ ERROR DETECTED:");
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
