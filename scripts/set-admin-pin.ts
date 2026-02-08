import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Setting up Admin: Marc Salas with PIN 1234...");

    const hashedPassword = await bcrypt.hash("1234", 10);

    // Upsert user: If email exists update, else create.
    // Since we want "Marc Salas" to be the login name, we ensure the name is set.
    // Email is required unique field, so we use a placeholder or his real one.
    const email = "admin@gymmanager.com";

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            name: "Marc Salas",
            role: "ADMIN",
            password: hashedPassword,
            active: true,
        },
        create: {
            email,
            name: "Marc Salas",
            role: "ADMIN",
            password: hashedPassword,
            active: true,
        },
    });

    console.log("Admin updated successfully:");
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log("PIN set to: 1234");
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
