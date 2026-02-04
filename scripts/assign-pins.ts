/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generatePin() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

async function main() {
    console.log("Starting PIN assignment (SQL mode)...");

    // Fetch all athletes without PIN
    const athletes: any[] = await prisma.$queryRaw`SELECT id, "firstName", "lastName" FROM "Athlete" WHERE "pin" IS NULL`;

    console.log(`Found ${athletes.length} athletes without PIN.`);

    for (const athlete of athletes) {
        let pin = generatePin();
        let unique = false;

        while (!unique) {
            const existing: any[] = await prisma.$queryRaw`SELECT id FROM "Athlete" WHERE "pin" = ${pin}`;
            if (existing.length === 0) {
                unique = true;
            } else {
                pin = generatePin();
            }
        }

        await prisma.$executeRaw`UPDATE "Athlete" SET "pin" = ${pin} WHERE "id" = ${athlete.id}`;
        console.log(`Assigned PIN ${pin} to ${athlete.firstName} ${athlete.lastName}`);
    }

    console.log("Done.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

export { };
