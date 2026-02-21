"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { Lead } from "@/types/lead";
import { toast } from "sonner";

export default function AddLeadDialog({
  onLeadCreated,
}: {
  onLeadCreated?: (lead: Lead) => void;
}) {
  const [open, setOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateLead = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName || "Unknown",
          jobTitle,
          platform: platform || null,
          notes: jobDescription || null,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string; detail?: string }
          | null;
        const message = data?.detail || data?.error || "Unable to create lead";
        setError(message);
        toast.error(message);
        return;
      }

      const created = (await response.json()) as Lead;
      onLeadCreated?.(created);
      toast.success("Lead created", {
        description: created.jobTitle || jobTitle || "Lead added to your list.",
      });

      setOpen(false);
      setJobTitle("");
      setPlatform("");
      setJobDescription("");
      setClientName("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create lead";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 mt-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleCreateLead();
          }}
        >
          <div>
            <Label className="mb-1">Job / Title *</Label>
            <Input
              placeholder="React dashboard project"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              required
            />
          </div>

          <div>
            <Label className="mb-1">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Upwork">Upwork</SelectItem>
                <SelectItem value="Fiverr">Fiverr</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1">Job Description</Label>
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label className="mb-1">Client Name (optional)</Label>
            <Input
              placeholder="John Doe / Company Name"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
