import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetAndSeed() {
    console.log("🧹 Resetting data...");

    // Reset payments and subscriptions
    await prisma.payment.deleteMany({});
    console.log("✓ Payments deleted");

    await prisma.subscription.deleteMany({});
    console.log("✓ Subscriptions deleted");

    // Check if membership exists
    const existingMembership = await prisma.membership.findFirst({
        where: { name: "Plan 3 días/semana" }
    });

    if (existingMembership) {
        console.log("✓ Membership 'Plan 3 días/semana' already exists");
    } else {
        // Create new membership
        await prisma.membership.create({
            data: {
                name: "Plan 3 días/semana",
                price: 50.0,
                durationDays: 30,
                weeklyLimit: 3,
                classCount: null,
                description: "3 sesiones por semana",
                active: true,
            }
        });
        console.log("✓ Created membership: Plan 3 días/semana (€50, 3/week, 30 days)");
    }

    console.log("\n✅ Data reset complete!");
}

resetAndSeed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
