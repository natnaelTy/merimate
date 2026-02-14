"use client";

import { useState, useEffect } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Sparkles, Loader2, Save, Copy, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types/lead";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingProposal, setIsSavingProposal] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) return;

    async function fetchLead() {
      try {
        const res = await fetch(`/api/leads/${leadId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load lead");
        const data = (await res.json()) as Lead;
        setLead(data);
        setClientName(data.clientName || "");
        setJobTitle(data.jobTitle || "");
        setPlatform(data.platform || "");
        setNotes(data.notes || "");
        setProposal(data.proposal || ""); // Assuming you added proposal field to Lead type
        setStatus(data.status);
      } catch (err) {
        setError("Could not load lead details.");
      }
    }
    fetchLead();
  }, [leadId]);

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
          jobDescription: notes || lead.notes || "",
          description: notes || lead.notes || "",
          platform: lead.platform,
          clientName: lead.clientName,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate proposal");
      const { proposal: generated } = await res.json();
      setProposal(generated);
    } catch (err) {
      setError("AI generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProposal = async () => {
    if (!lead || !proposal.trim()) return;
    setIsSavingProposal(true);

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal }),
    });

    if (res.ok) {
      const updated = await res.json();
      setLead(updated);
      setProposal(updated.proposal || "");
    }

    setIsSavingProposal(false);
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
    }

    setIsSavingNotes(false);
  };

  const handleSetReminder = async () => {
    if (!lead || !reminderDate) return;
    setIsSettingReminder(true);

    // You can add time picker later; for now just date
    const reminderISO = reminderDate.toISOString();

    const res = await fetch(`/api/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        reminderDate: reminderISO,
        type: "follow-up", // or "initial" etc.
      }),
    });

    if (res.ok) {
      // Optional: update local lead with reminder info
      alert("Reminder set! (Implement email/cron in backend)");
      setReminderDate(undefined);
    }

    setIsSettingReminder(false);
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
    }
  };

  const handleStatusChange = async (newStatus: Lead["status"]) => {
    if (!lead) return;
    setStatus(newStatus);

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      const data = await res.json();
      setLead(data);
      setStatus(data.status);
    }
  };

  if (error) return <p className="p-8 text-destructive">{error}</p>;
  if (!lead) return <p className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></p>;

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
                  {lead.clientName && <span>• Client: {lead.clientName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="px-3 py-1 text-sm">
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
                  onClick={() => navigator.clipboard.writeText(proposal)}
                  disabled={!proposal.trim()}
                  variant="secondary"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button
                  onClick={handleSaveProposal}
                  disabled={isSavingProposal || !proposal.trim()}
                >
                  {isSavingProposal ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Proposal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Controls */}
          <div className="space-y-6">
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

            {/* Status */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="proposal-sent">Proposal Sent</SelectItem>
                    <SelectItem value="waiting-response">Waiting Response</SelectItem>
                    <SelectItem value="follow-up-needed">Follow-up Needed</SelectItem>
                    <SelectItem value="won">Won 🎉</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Reminder */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Follow-up Reminder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <Button
                  onClick={handleSetReminder}
                  disabled={isSettingReminder || !reminderDate}
                  className="w-full"
                >
                  {isSettingReminder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Set Reminder
                </Button>
                <p className="text-xs text-muted-foreground">
                  We'll remind you to follow up (email coming soon).
                </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}