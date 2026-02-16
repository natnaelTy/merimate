export const leadStatuses = [
  "new",
  "proposal",
  "waiting",
  "follow-up",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type Lead = {
  id: string;
  clientName: string;
  jobTitle: string;
  platform: string | null;
  status: LeadStatus;
  lastContact: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  proposal?: string;
  description?: string;
  nextReminderAt?: string | null;
  reminders?: string[];
};
