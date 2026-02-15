-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripeAccountId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Insert default organization for existing data
INSERT INTO "Organization" ("id", "name", "stripeAccountId")
VALUES ('cldefaultorg000000000000000', 'Default Organization', NULL);

-- Add organizationId to Event (nullable first for backfill)
ALTER TABLE "Event" ADD COLUMN "organizationId" TEXT;

-- Backfill existing events with default organization
UPDATE "Event" SET "organizationId" = 'cldefaultorg000000000000000' WHERE "organizationId" IS NULL;

-- Make organizationId required and add FK
ALTER TABLE "Event" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add organizationId to Upload (nullable first for backfill)
ALTER TABLE "Upload" ADD COLUMN "organizationId" TEXT;

-- Backfill existing uploads with default organization
UPDATE "Upload" SET "organizationId" = 'cldefaultorg000000000000000' WHERE "organizationId" IS NULL;

-- Make organizationId required and add FK
ALTER TABLE "Upload" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
