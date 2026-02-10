export type LeadStatus =
  | "new"
  | "proposal"
  | "waiting"
  | "follow-up"
  | "won"
  | "lost";

export type Lead = {
  id: string;
  userId: string;
  clientName: string;
  jobTitle: string;
  platform: string | null;
  status: LeadStatus;
  lastContact: string | null;
  notes: string | null;
  createdAt: string;
};
