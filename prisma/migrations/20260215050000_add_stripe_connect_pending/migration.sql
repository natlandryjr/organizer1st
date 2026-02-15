-- CreateTable
CREATE TABLE "StripeConnectPending" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "StripeConnectPending_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeConnectPending_accountId_key" ON "StripeConnectPending"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeConnectPending_organizationId_key" ON "StripeConnectPending"("organizationId");

-- AddForeignKey
ALTER TABLE "StripeConnectPending" ADD CONSTRAINT "StripeConnectPending_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
