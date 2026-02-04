/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Ensuring Marc Salas exists...");

    const firstName = "Marc";
    const lastName = "Salas";
    const pin = "1234";

    // Check if exists
    const existing = await prisma.athlete.findFirst({
        where: {
            firstName: { equals: firstName, mode: 'insensitive' },
            lastName: { equals: lastName, mode: 'insensitive' }
        }
    });

    if (existing) {
        console.log(`Found athlete: ${existing.firstName} ${existing.lastName} (ID: ${existing.id})`);

        // Update PIN using raw query to avoid type issues if client is stale
        await prisma.$executeRaw`UPDATE "Athlete" SET "pin" = ${pin} WHERE "id" = ${existing.id}`;
        console.log("PIN updated to 1234.");
    } else {
        console.log("Athlete not found. Creating...");

        // Create with minimal required fields
        // Since we want to set PIN immediately and might have type issues, we create then update via SQL, 
        // OR use SQL to create. Prisma create is easier for other fields.
        const newAthlete = await prisma.athlete.create({
            data: {
                firstName,
                lastName,
                email: "marc.salas@example.com", // Placeholder
                status: "ACTIVE",
                level: "ADVANCED",
                goal: "COMPETITION"
            }
        });

        console.log(`Created athlete with ID: ${newAthlete.id}`);
        await prisma.$executeRaw`UPDATE "Athlete" SET "pin" = ${pin} WHERE "id" = ${newAthlete.id}`;
        console.log("PIN set to 1234.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

export { };
