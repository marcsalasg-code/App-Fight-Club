import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "marc@gymmanager.com"; // Placeholder email if not known, or update if user provided one. 
    // User said "marc salas". I'll assume a standard email or check DB. 
    // Better to just upsert based on name if unique, but email is unique constraint.
    // I'll create a user with email "admin@marcsalas.com" for now, or "marc@test.com".
    // Actually, I'll search for "Marc Salas" first.

    const password = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@gymmanager.com" },
        update: {
            name: "Marc Salas",
            role: "ADMIN",
            password: password,
            active: true,
        },
        create: {
            email: "admin@gymmanager.com",
            name: "Marc Salas",
            role: "ADMIN", // User said "Coach and Admin", but Schema usually has single role string.
            // If schema has single role: ADMIN implies Coach access usually. 
            // Or I need to check if I can have multiple roles. 
            // Schema said: role String @default("COACH") // ADMIN, COACH
            // So it's single role. ADMIN > COACH.
            password: password,
            active: true,
        },
    });

    console.log({ admin });
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
