import { PrismaClient } from "@prisma/client";
import { CLASS_TYPES, CLASS_COLORS } from "../src/lib/constants";
import { TYPE_COLORS } from "../src/components/calendar/types";

// Types for constants (since they are imported)
type ClassTypeConstant = { value: string; label: string };
type ClassColorConstant = { value: string; label: string };

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Constants Migration...");

    // 1. Migrate Class Types
    console.log("📦 Migrating Class Types...");
    for (const type of CLASS_TYPES) {
        // Find associated colors
        // Default logic: map value to a color from TYPE_COLORS or fallback
        const typeColors = TYPE_COLORS[type.value] || TYPE_COLORS.default;

        // Check if icon exists in mapping (optional, or just use default)
        let iconName = "Dumbbell"; // Default
        if (type.value.includes("THAI")) iconName = "Sword";
        if (type.value.includes("BOXING")) iconName = "Swords";
        if (type.value.includes("KIDS")) iconName = "Baby";
        if (type.value.includes("CONDITIONING")) iconName = "Activity";

        await prisma.classType.upsert({
            where: { code: type.value },
            update: {
                label: type.label,
                // Only update visual props if you want to override user changes, 
                // but since this is first run, it's fine. 
                // Better: dont update visual props if they exist to respect user changes?
                // For now, let's enforce consistency with current constants.
                color: typeColors.bg,
                borderColor: typeColors.border,
            },
            create: {
                code: type.value,
                label: type.label,
                color: typeColors.bg,
                borderColor: typeColors.border,
                icon: iconName,
                active: true,
            },
        });
        console.log(`   - Synced: ${type.label}`);
    }

    // 2. Migrate Competition Categories (Initial Set)
    console.log("🏆 Migrating Competition Categories...");
    const initialCategories = [
        { name: "Adulto -60kg", gender: "MALE", max: 60 },
        { name: "Adulto -70kg", gender: "MALE", max: 70 },
        { name: "Adulto -80kg", gender: "MALE", max: 80 },
        { name: "Adulto +80kg", gender: "MALE", min: 80 },
        { name: "Femenino Open", gender: "FEMALE" },
        { name: "Kids", gender: "MIXED" },
    ];

    for (const cat of initialCategories) {
        const existing = await prisma.competitionCategory.findFirst({
            where: { name: cat.name }
        });

        if (!existing) {
            await prisma.competitionCategory.create({
                data: {
                    name: cat.name,
                    gender: cat.gender,
                    maxWeight: cat.max,
                    minWeight: cat.min,
                    active: true,
                }
            });
            console.log(`   - Created: ${cat.name}`);
        }
    }

    // 3. Migrate Event Types (Initial Set)
    console.log("📅 Migrating Event Types...");
    const initialEventTypes = ["Torneo", "Interclub", "Seminario", "Exhibición"];

    for (const label of initialEventTypes) {
        const existing = await prisma.eventType.findFirst({ where: { label } });
        if (!existing) {
            await prisma.eventType.create({
                data: { label, active: true }
            });
            console.log(`   - Created: ${label}`);
        }
    }

    console.log("✅ Migration Initialized Successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
