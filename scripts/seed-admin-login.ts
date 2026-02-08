
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("1234", 10);

    const user = await prisma.user.upsert({
        where: { email: "marc@gymmanager.com" }, // Use this email as key
        update: {
            name: "Marc Salas",
            // If they login with "1234", this hash will match.
            // If they use "admin123", we overwrite it to "1234".
            password: hashedPassword,
            role: "ADMIN",
            active: true,
        },
        create: {
            email: "marc@gymmanager.com",
            name: "Marc Salas",
            password: hashedPassword,
            role: "ADMIN",
            active: true,
        },
    });

    console.log("Upserted user:", user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
