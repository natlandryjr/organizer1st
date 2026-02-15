-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FLAT');

-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Section" ADD COLUMN "ticketTypeId" TEXT;
ALTER TABLE "Table" ADD COLUMN "ticketTypeId" TEXT;

-- Create default ticket type for existing events and assign to sections/tables
DO $$
DECLARE
  ev RECORD;
  tt_id TEXT;
BEGIN
  FOR ev IN SELECT id FROM "Event"
  LOOP
    tt_id := 'cl' || replace(gen_random_uuid()::text, '-', '');
    INSERT INTO "TicketType" ("id", "eventId", "name", "price", "quantity")
    VALUES (tt_id, ev.id, 'General Admission', 5000, NULL);
    UPDATE "Section" SET "ticketTypeId" = tt_id WHERE "venueMapId" IN (SELECT id FROM "VenueMap" WHERE "eventId" = ev.id);
    UPDATE "Table" SET "ticketTypeId" = tt_id WHERE "venueMapId" IN (SELECT id FROM "VenueMap" WHERE "eventId" = ev.id);
  END LOOP;
END $$;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
