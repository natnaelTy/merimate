-- Add emailSentAt column to reminders for deduped reminder emails
ALTER TABLE "reminders"
  ADD COLUMN IF NOT EXISTS "emailSentAt" TIMESTAMP(3);
