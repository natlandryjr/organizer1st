-- AlterEnum
ALTER TYPE "SeatStatus" ADD VALUE 'HELD';

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "holdId" TEXT;

-- CreateTable
CREATE TABLE "Hold" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hold_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_holdId_fkey" FOREIGN KEY ("holdId") REFERENCES "Hold"("id") ON DELETE SET NULL ON UPDATE CASCADE;
