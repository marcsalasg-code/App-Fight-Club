/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

async function main() {
    const now = new Date();
    const dayName = days[now.getDay()];

    // Set start time to 10 minutes ago to be safely inside the window
    const startHour = now.getHours().toString().padStart(2, '0');
    const startMinute = Math.max(0, now.getMinutes() - 5).toString().padStart(2, '0'); // 5 mins ago
    const startTime = `${startHour}:${startMinute}`;

    // End time + 1 hour
    const endHour = (now.getHours() + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:${startMinute}`;

    console.log(`Creating Test Class for ${dayName} at ${startTime}...`);

    const newClass = await prisma.class.create({
        data: {
            name: "Clase de Prueba (Check-in)",
            type: "MUAY_THAI",
            dayOfWeek: dayName,
            startTime: startTime,
            endTime: endTime,
            maxCapacity: 20
        }
    });

    console.log(`Created class: ${newClass.name} (ID: ${newClass.id})`);
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
