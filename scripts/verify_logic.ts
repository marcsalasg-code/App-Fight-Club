
import { PrismaClient } from '@prisma/client';
import { toZonedTime } from 'date-fns-tz';

const prisma = new PrismaClient();

const GYM_TIMEZONE = 'Europe/Madrid';

async function main() {
    console.log("--- Starting Logic Verification ---");

    // 1. Setup Settings
    console.log("1. Updating Gym Settings to 180min late window...");
    await prisma.gymSettings.upsert({
        where: { id: "settings" }, // Assuming single row or we find first
        update: { checkInLateMinutes: 180 },
        create: { checkInLateMinutes: 180 }
    });
    // Note: The actual code uses findFirst logic, let's replicate that update
    const settings = await prisma.gymSettings.findFirst();
    if (settings) {
        await prisma.gymSettings.update({
            where: { id: settings.id },
            data: { checkInLateMinutes: 180 }
        });
    }
    console.log("Settings updated.");

    // 2. Find/Create Class for Tuesday 20:00
    console.log("2. Verifying Class 'Muay Thai' Tuesday 20:00...");
    let targetClass = await prisma.class.findFirst({
        where: {
            dayOfWeek: "TUESDAY",
            startTime: "20:00"
        }
    });

    if (!targetClass) {
        console.log("Class not found, creating it...");
        targetClass = await prisma.class.create({
            data: {
                name: "Muay Thai (Noche)",
                type: "MUAY_THAI",
                dayOfWeek: "TUESDAY",
                startTime: "20:00",
                endTime: "21:30",
                maxCapacity: 20
            }
        });
    }
    console.log("Class ID:", targetClass.id);

    // 3. Find Athlete "Marc Salas"
    console.log("3. Finding Athlete Marc Salas...");
    const athlete = await prisma.athlete.findUnique({
        where: { pin: "1234" }
    });

    if (!athlete) {
        console.error("Athlete Marc Salas (PIN 1234) not found!");
        return;
    }
    console.log("Athlete found:", athlete.firstName);

    // 4. Simulate Check-in Logic
    console.log("4. Simulating Check-in at 2026-02-03 22:30 (150 mins after start)...");

    // We want to verify logic: 
    // Class Start: Today (Feb 3 2026) 20:00
    // Now: Feb 3 2026 22:30
    // Diff: 150 mins
    // Late Limit: 180 mins
    // Should be VALID.

    // Let's manually run the math used in checkin.ts
    const nowSimulated = new Date("2026-02-03T22:30:00"); // Local time simulation
    // In checkin.ts we use toZonedTime(new Date(), timezone)
    // If we assume system time is correct, we just compare timestamps.

    // Parse start time relative to "Today" (Simulated Day)
    const [hours, minutes] = targetClass.startTime.split(':').map(Number);
    const classStartTime = new Date(nowSimulated);
    classStartTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = (nowSimulated.getTime() - classStartTime.getTime()) / (1000 * 60);
    console.log(`Class Start: ${classStartTime.toLocaleTimeString()}`);
    console.log(`Simulated Now: ${nowSimulated.toLocaleTimeString()}`);
    console.log(`Diff: ${diffMinutes} minutes`);
    console.log(`Limit: 180 minutes`);

    if (diffMinutes <= 180) {
        console.log("✅ Check-in VALID (Within 180min window)");

        // 5. Create Attendance
        console.log("5. Registering Attendance...");
        const attendance = await prisma.attendance.create({
            data: {
                athleteId: athlete.id,
                classId: targetClass.id,
                date: nowSimulated,
                checkInTime: nowSimulated,
                method: "QR_VERIFIED"
            }
        });
        console.log("✅ Attendance created:", attendance.id);

    } else {
        console.error("❌ Check-in INVALID (Time expired)");
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
