"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { differenceInCalendarDays, format } from "date-fns";
import { CalendarIcon, Sparkles, Loader2, Copy, Archive, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types/lead";
import { toast } from "sonner";

type Reminder = {
  id: string;
  leadId: string;
  reminderAt: string;
  sent: boolean;
  type: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};

const formatStatus = (status: Lead["status"]) =>
  status
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [lead, setLead] = useState<Lead | null>(null);
  const [clientName, setClientName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [proposal, setProposal] = useState("");
  const [status, setStatus] = useState<Lead["status"]>("new");
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);
  const [clientMessage, setClientMessage] = useState("");
  const [followUpDraft, setFollowUpDraft] = useState("");
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [messageSource, setMessageSource] = useState<"paste" | "notes">("paste");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [isUpdatingReminder, setIsUpdatingReminder] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // use Sonner's toast for notifications

  const loadLead = useCallback(async () => {
    if (!leadId) return;

    try {
      const res = await fetch(`/api/leads/${leadId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load lead");
      const data = (await res.json()) as Lead;
      setLead(data);
      setClientName(data.clientName || "");
      setJobTitle(data.jobTitle || "");
      setPlatform(data.platform || "");
      setNotes(data.notes || "");
      setProposal(data.proposal || "");
      setStatus(data.status);
    } catch (err) {
      setError("Could not load lead details.");
    }
  }, [leadId]);

  const loadReminders = useCallback(async () => {
    if (!leadId) return;
    const res = await fetch(`/api/reminders?leadId=${leadId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as Reminder[];
    setReminders(data);
  }, [leadId]);

  useEffect(() => {
    if (!leadId) return;
    void loadLead();
    void loadReminders();
  }, [leadId, loadLead, loadReminders]);

  useEffect(() => {
    if (followUpDraft.trim()) return;
    const draft = reminders.find((reminder) => !reminder.sent && reminder.message)?.message;
    if (draft) {
      setFollowUpDraft(draft);
      setIsReplyOpen(true);
    }
  }, [followUpDraft, reminders]);

  const handleGenerateProposal = async () => {
    if (!lead) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          jobTitle: lead.jobTitle,
          description: lead.description,
          platform: lead.platform,
          clientName: lead.clientName,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate");
      const { proposal: generated } = await res.json();
      setProposal(generated);

      // Optional: auto-save proposal and update status
      await handleAutoSaveProposalAndStatus(generated);
    } catch (err) {
      setError("Failed to generate proposal.");
      toast.error("Failed to generate proposal");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoSaveProposalAndStatus = async (generatedProposal: string) => {
    if (!lead) return;

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposal: generatedProposal,
        status: "proposal",
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setLead(updated);
      setProposal(updated.proposal || "");
      setStatus(updated.status);
      toast.success("Proposal saved", { description: "Saved to the lead." });
    } else {
      toast.error("Failed to save proposal");
    }
  };

  const handleCopyProposal = async () => {
    if (!proposal.trim()) return;
    try {
      await navigator.clipboard.writeText(proposal);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleGenerateFollowUp = async () => {
    if (!lead) return;
    const sourceMessage =
      messageSource === "notes" ? lead.notes?.trim() || "" : clientMessage.trim();

    if (!sourceMessage) {
      toast.error(
        messageSource === "notes"
          ? "Add notes first or choose Paste message."
          : "Paste the client message first."
      );
      return;
    }
    setIsGeneratingFollowUp(true);
    setFollowUpError(null);

    try {
      const response = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: lead.clientName,
          jobTitle: lead.jobTitle,
          lastMessage: sourceMessage,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to generate follow-up");
      }

      const data = (await response.json()) as { message: string };
      setFollowUpDraft(data.message);
      setIsReplyOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate follow-up.";
      setFollowUpError(message);
      toast.error(message);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleCopyFollowUp = async () => {
    if (!followUpDraft.trim()) return;
    try {
      await navigator.clipboard.writeText(followUpDraft);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleSetReminder = async () => {
    if (!lead || !reminderDate) return;
    setIsSettingReminder(true);

    const reminderISO = reminderDate.toISOString();

    const res = await fetch(`/api/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        reminderDate: reminderISO,
      }),
    });

    if (res.ok) {
      // Auto-update status when reminder is set
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "follow-up" }),
      });
      toast.success("Reminder set", { description: "We'll remind you to follow up." });
      setReminderDate(undefined);
      await loadReminders();
    } else {
      toast.error("Failed to set reminder");
    }

    setIsSettingReminder(false);
  };

  const handleMarkReminderSent = async (reminderId: string) => {
    if (isUpdatingReminder) return;
    setIsUpdatingReminder(true);

    const res = await fetch(`/api/reminders/${reminderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sent: true }),
    });

    if (res.ok) {
      toast.success("Reminder marked as sent");
      await loadReminders();
    } else {
      toast.error("Failed to update reminder");
    }

    setIsUpdatingReminder(false);
  };

  const handleSaveDetails = async () => {
    if (!lead) return;
    setIsSavingDetails(true);

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: clientName.trim() || null,
        jobTitle: jobTitle.trim(),
        platform: platform.trim() || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setLead(data);
      setClientName(data.clientName || "");
      setJobTitle(data.jobTitle || "");
      setPlatform(data.platform || "");
      toast.success("Details updated", { description: "Lead details saved." });
    } else {
      toast.error("Failed to update details");
    }

    setIsSavingDetails(false);
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    setIsSavingNotes(true);

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    if (res.ok) {
      const data = await res.json();
      setLead(data);
      setNotes(data.notes || "");
      toast.success("Notes saved");
    } else {
      toast.error("Failed to save notes");
    }

    setIsSavingNotes(false);
  };

  const handleArchiveLead = async () => {
    if (!lead || isArchiving) return;
    if (!confirm("Archive this lead?")) return;

    setIsArchiving(true);

    const res = await fetch(`/api/leads/${lead.id}/archive`, { method: "POST" });
    if (res.ok) {
      router.push("/leads");
    } else {
      setIsArchiving(false);
      toast.error("Failed to archive lead");
    }
  };

  const pendingReminders = reminders
    .filter((reminder) => !reminder.sent)
    .sort(
      (a, b) =>
        new Date(a.reminderAt).getTime() - new Date(b.reminderAt).getTime()
    );

  const getReminderBadge = (reminderAt: string) => {
    const date = new Date(reminderAt);
    if (Number.isNaN(date.getTime())) return null;
    const diff = differenceInCalendarDays(date, new Date());

    if (diff < 0) return { label: "Overdue", tone: "danger" as const };
    if (diff === 0) return { label: "Due today", tone: "warning" as const };
    if (diff === 1) return { label: "Due tomorrow", tone: "warning" as const };
    return { label: "Upcoming", tone: "default" as const };
  };

  const formatFollowUpType = (type?: string | null) => {
    if (!type || type === "follow-up") return "Follow-up";
    if (type === "proposal-update") return "Proposal update";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };


  if (error) return <p className="p-8 text-destructive">{error}</p>;
  if (!lead) return <p className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></p>

  return (
    <div className="min-h-screen">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Card */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">{lead.jobTitle || "Untitled Lead"}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">{lead.platform || "Unknown Platform"}</span>
                  {lead.clientName && <span> • Client: {lead.clientName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="px-3 py-1 text-xs bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  {formatStatus(status)}
                </Badge>
                <Button variant="destructive" size="sm" onClick={handleArchiveLead} disabled={isArchiving}>
                  {isArchiving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Archive className="h-4 w-4 mr-2" />}
                  Archive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Proposal Section */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Proposal</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-generated proposal — edit, copy, and send to the client.
                </p>
              </div>
              <Button onClick={handleGenerateProposal} disabled={isGenerating || !lead.jobTitle}>
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate AI Proposal
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Your proposal will appear here after generation..."
                className="min-h-[320px] resize-y font-mono text-sm leading-relaxed"
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleCopyProposal}
                  disabled={!proposal.trim()}
                  variant="secondary"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Controls */}
          <div className="space-y-6">
            {/* Follow-up */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Follow-Up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Next follow-up date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reminderDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reminderDate ? format(reminderDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reminderDate}
                        onSelect={setReminderDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  onClick={handleSetReminder}
                  disabled={isSettingReminder || !reminderDate}
                  className="w-full"
                >
                  {isSettingReminder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Schedule Follow-Up
                </Button>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll remind you to follow up (email coming soon).
                </p>

                <Collapsible
                  open={isReplyOpen}
                  onOpenChange={setIsReplyOpen}
                  className="rounded-md border border-border/60 bg-background/60"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium">
                    <span>Generate reply to recent client message</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isReplyOpen ? "rotate-180" : ""
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 px-3 pb-3">
                    <p className="text-xs text-muted-foreground">
                      Choose a source for the client&apos;s latest message.
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Message source
                      </label>
                      <Select
                        value={messageSource}
                        onValueChange={(value) =>
                          setMessageSource(value as "paste" | "notes")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paste">Paste message</SelectItem>
                          <SelectItem value="notes">Use lead notes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {messageSource === "paste" ? (
                      <Textarea
                        value={clientMessage}
                        onChange={(event) => setClientMessage(event.target.value)}
                        placeholder="Paste the client message here..."
                        className="min-h-[120px]"
                      />
                    ) : (
                      <div className="rounded-md border border-border/60 bg-background/80 p-3 text-xs text-muted-foreground">
                        {lead?.notes?.trim()
                          ? lead.notes
                          : "No notes yet. Add notes on this lead or choose Paste message."}
                      </div>
                    )}
                    <Button
                      onClick={handleGenerateFollowUp}
                      disabled={
                        isGeneratingFollowUp ||
                        (messageSource === "paste"
                          ? !clientMessage.trim()
                          : !(lead?.notes?.trim() || ""))
                      }
                      className="w-full"
                    >
                      {isGeneratingFollowUp ? "Generating..." : "Generate AI Response"}
                    </Button>
                    {followUpError ? (
                      <p className="text-xs text-destructive">{followUpError}</p>
                    ) : null}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">AI response</p>
                      <Textarea
                        value={followUpDraft}
                        onChange={(event) => setFollowUpDraft(event.target.value)}
                        placeholder="Your AI response will appear here..."
                        className="min-h-[140px]"
                      />
                      <Button
                        variant="secondary"
                        onClick={handleCopyFollowUp}
                        disabled={!followUpDraft.trim()}
                        className="w-full"
                      >
                        <Copy className="mr-2 h-4 w-4" /> Copy response
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {pendingReminders.length > 0 ? (
                  <div className="rounded-md border border-border/60 bg-background/60 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next follow-up</span>
                      {(() => {
                        const badge = getReminderBadge(pendingReminders[0].reminderAt);
                        return badge ? (
                          <Badge variant={badge.tone} className="text-[10px]">
                            {badge.label}
                          </Badge>
                        ) : null;
                      })()}
                    </div>
                    <p className="mt-2 text-sm font-medium">
                      {format(new Date(pendingReminders[0].reminderAt), "PPP")}
                    </p>
                    {pendingReminders[0].message ? (
                      <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                        {pendingReminders[0].message}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {formatFollowUpType(pendingReminders[0].type)}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 w-full"
                      disabled={isUpdatingReminder}
                      onClick={() => handleMarkReminderSent(pendingReminders[0].id)}
                    >
                      {isUpdatingReminder ? "Updating..." : "Mark as done"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No upcoming follow-ups.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Client preferences, objections, next steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[140px]"
                />
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || !notes.trim()}
                  className="w-full"
                >
                  {isSavingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </CardContent>
            </Card>
            
            {/* Lead Details */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client name (for personalization)</label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job title</label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upwork">Upwork</SelectItem>
                      <SelectItem value="Fiverr">Fiverr</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSaveDetails}
                  disabled={isSavingDetails || !jobTitle.trim()}
                  className="w-full"
                >
                  {isSavingDetails ? "Saving..." : "Update Details"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
