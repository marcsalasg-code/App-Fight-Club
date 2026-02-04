-- CreateTable
CREATE TABLE "GymSettings" (
    "id" TEXT NOT NULL,
    "gymName" TEXT NOT NULL DEFAULT 'RC Fight Club',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "checkInEarlyMinutes" INTEGER NOT NULL DEFAULT 15,
    "checkInLateMinutes" INTEGER NOT NULL DEFAULT 40,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GymSettings_pkey" PRIMARY KEY ("id")
);
