import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schedule = [
    // Lunes
    { day: "MONDAY", start: "10:00", end: "11:30", type: "MUAY_THAI", name: "Muay Thai Mañana" },
    { day: "MONDAY", start: "17:00", end: "18:30", type: "MUAY_THAI", name: "Muay Thai Tarde 1" },
    { day: "MONDAY", start: "18:30", end: "20:00", type: "MUAY_THAI", name: "Muay Thai Tarde 2" },
    { day: "MONDAY", start: "20:00", end: "21:30", type: "MUAY_THAI", name: "Muay Thai Noche" },

    // Martes
    { day: "TUESDAY", start: "09:30", end: "10:30", type: "CONDITIONING", name: "Woman Funcional", level: "ALL" },
    { day: "TUESDAY", start: "13:00", end: "14:30", type: "MUAY_THAI", name: "Muay Thai Mediodía" },
    { day: "TUESDAY", start: "17:30", end: "18:30", type: "MUAY_THAI", name: "Muay Thai Kids", level: "BEGINNER" },
    { day: "TUESDAY", start: "18:30", end: "20:00", type: "MUAY_THAI", name: "Muay Thai Tarde" },
    { day: "TUESDAY", start: "20:00", end: "21:30", type: "MUAY_THAI", name: "Muay Thai Noche" },

    // Miércoles (Mismo que Lunes)
    { day: "WEDNESDAY", start: "10:00", end: "11:30", type: "MUAY_THAI", name: "Muay Thai Mañana" },
    { day: "WEDNESDAY", start: "17:00", end: "18:30", type: "MUAY_THAI", name: "Muay Thai Tarde 1" },
    { day: "WEDNESDAY", start: "18:30", end: "20:00", type: "MUAY_THAI", name: "Muay Thai Tarde 2" },
    { day: "WEDNESDAY", start: "20:00", end: "21:30", type: "MUAY_THAI", name: "Muay Thai Noche" },

    // Jueves (Mismo que Martes)
    { day: "THURSDAY", start: "09:30", end: "10:30", type: "CONDITIONING", name: "Woman Funcional", level: "ALL" },
    { day: "THURSDAY", start: "13:00", end: "14:30", type: "MUAY_THAI", name: "Muay Thai Mediodía" },
    { day: "THURSDAY", start: "17:30", end: "18:30", type: "MUAY_THAI", name: "Muay Thai Kids", level: "BEGINNER" },
    { day: "THURSDAY", start: "18:30", end: "20:00", type: "MUAY_THAI", name: "Muay Thai Tarde" },
    { day: "THURSDAY", start: "20:00", end: "21:30", type: "MUAY_THAI", name: "Muay Thai Noche" },

    // Viernes
    { day: "FRIDAY", start: "10:00", end: "11:30", type: "MUAY_THAI", name: "Muay Thai Mañana" },
    { day: "FRIDAY", start: "17:00", end: "18:30", type: "MUAY_THAI", name: "Muay Thai Tarde 1" },
    { day: "FRIDAY", start: "18:30", end: "20:00", type: "MUAY_THAI", name: "Muay Thai Tarde 2" },
    { day: "FRIDAY", start: "20:00", end: "21:30", type: "MUAY_THAI", name: "Muay Thai Noche" },
];

async function main() {
    console.log("Start seeding...");

    // Clear existing classes if needed (optional, safer to not delete if data exists, but for 'reset' behavior it's useful. 
    // For this task, I'll update or create to avoid duplicates based on unique constraints if possible, but simplest is to delete all classes first or just upsert)
    // Since we want to replace the schedule, we'll delete all active classes first to avoid clutter.
    await prisma.class.deleteMany({});

    for (const cls of schedule) {
        await prisma.class.create({
            data: {
                name: cls.name,
                type: cls.type,
                dayOfWeek: cls.day, // Use cls.day as dayOfWeek
                startTime: cls.start,
                endTime: cls.end,
                maxCapacity: 20,
                levelRequired: cls.level || null,
                active: true,
            },
        });
    }

    // Seed Memberships (Upsert to avoid duplicates)
    const memberships = [
        { name: "Mensual Ilimitado", price: 65, durationDays: 30, weeklyLimit: null, description: "Acceso ilimitado durante 30 días" },
        { name: "Pack 2 días/semana", price: 45, durationDays: 30, weeklyLimit: 2, description: "2 clases por semana durante 30 días" },
        { name: "Pack 3 días/semana", price: 55, durationDays: 30, weeklyLimit: 3, description: "3 clases por semana durante 30 días" },
        { name: "Bono 10 clases", price: 80, durationDays: null, classCount: 10, weeklyLimit: null, description: "10 clases sin fecha de caducidad" },
        { name: "Clase suelta", price: 12, durationDays: null, classCount: 1, weeklyLimit: null, description: "Clase individual" },
    ];

    for (const m of memberships) {
        const existing = await prisma.membership.findFirst({ where: { name: m.name } });
        if (existing) {
            await prisma.membership.update({
                where: { id: existing.id },
                data: { price: m.price, durationDays: m.durationDays, classCount: m.classCount ?? null, weeklyLimit: m.weeklyLimit, description: m.description },
            });
        } else {
            await prisma.membership.create({
                data: { name: m.name, price: m.price, durationDays: m.durationDays, classCount: m.classCount ?? null, weeklyLimit: m.weeklyLimit, description: m.description },
            });
        }
    }

    console.log("Seeding finished.");
    console.log("Seeding finished.");

    // Create/Upsert Users (Admin & Coach)
    // Hash passwords: "1234" (Marc) and "0000" (Javi)
    // Using bcryptjs directly here since we can't import from src easily in seed
    const bcrypt = require("bcryptjs");
    const adminPassword = await bcrypt.hash("1234", 10);
    const coachPassword = await bcrypt.hash("0000", 10);

    // Marc (Admin)
    await prisma.user.upsert({
        where: { email: "marc@gymmanager.com" },
        update: {
            password: adminPassword,
            role: "ADMIN",
            name: "Marc",
            active: true
        },
        create: {
            email: "marc@gymmanager.com",
            password: adminPassword,
            name: "Marc",
            role: "ADMIN",
            active: true
        }
    });

    // Javi (Coach)
    await prisma.user.upsert({
        where: { email: "coach@gymmanager.com" },
        update: {
            password: coachPassword,
            role: "COACH",
            name: "Javi",
            active: true
        },
        create: {
            email: "coach@gymmanager.com",
            password: coachPassword,
            name: "Javi",
            role: "COACH",
            active: true
        }
    });

    console.log("Users seeded successfully.");

    process.exit(0);
}

main()
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
