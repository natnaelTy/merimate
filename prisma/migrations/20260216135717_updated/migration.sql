/*
    Warnings:

    - You are about to drop the legacy tables ("Lead", "Message", "Reminder", "User").
    - This migration recreates tables with new names and columns; existing data will be lost.

*/

-- Drop legacy foreign keys (if they exist)
ALTER TABLE IF EXISTS "Lead" DROP CONSTRAINT IF EXISTS "Lead_userId_fkey";
ALTER TABLE IF EXISTS "Message" DROP CONSTRAINT IF EXISTS "Message_leadId_fkey";
ALTER TABLE IF EXISTS "Message" DROP CONSTRAINT IF EXISTS "Message_userId_fkey";
ALTER TABLE IF EXISTS "Reminder" DROP CONSTRAINT IF EXISTS "Reminder_leadId_fkey";

-- Drop legacy tables (if they exist)
DROP TABLE IF EXISTS "Message";
DROP TABLE IF EXISTS "Reminder";
DROP TABLE IF EXISTS "Lead";
DROP TABLE IF EXISTS "User";

-- Drop new tables if a previous attempt partially created them
DROP TABLE IF EXISTS "messages";
DROP TABLE IF EXISTS "reminders";
DROP TABLE IF EXISTS "leads";
DROP TABLE IF EXISTS "users";

-- Recreate enum with the new values
DROP TYPE IF EXISTS "LeadStatus";
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'PROPOSAL', 'WAITING', 'FOLLOW_UP', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobTitle" TEXT,
    "description" TEXT,
    "platform" TEXT,
    "clientName" TEXT,
    "proposal" TEXT,
    "notes" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "reminderAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'follow-up',
    "message" TEXT,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "leads_userId_idx" ON "leads"("userId");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "messages_leadId_createdAt_idx" ON "messages"("leadId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "reminders_userId_reminderAt_idx" ON "reminders"("userId", "reminderAt");

-- CreateIndex
CREATE INDEX "reminders_leadId_idx" ON "reminders"("leadId");

-- CreateIndex
CREATE INDEX "reminders_sent_reminderAt_idx" ON "reminders"("sent", "reminderAt");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
