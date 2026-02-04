/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Checking attendance records for today...");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
        where: {
            date: {
                gte: startOfDay
            }
        },
        include: {
            athlete: true,
            class: true
        }
    });

    if (attendances.length === 0) {
        console.log("No attendance records found for today.");
    } else {
        console.log(`Found ${attendances.length} records:`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attendances.forEach((a: any) => {
            console.log(`- ${a.athlete.firstName} ${a.athlete.lastName} checked in to ${a.class.name} at ${a.checkInTime.toLocaleTimeString()} via ${a.method}`);
        });
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
