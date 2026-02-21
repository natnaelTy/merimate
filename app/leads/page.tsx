"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import AddLeadDialog from "@/components/leads/LeadCreateDialog";
import { Separator } from "@/components/ui/separator";
import type { Lead } from "@/types/lead";
import LeadsSkeleton from "./LeadsSkeleton";
import { toast } from "sonner";

const formatStatus = (status: Lead["status"]) =>
  status
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const response = await fetch("/api/leads", { cache: "no-store" });
        if (!response.ok) {
          const message = "Unable to load leads";
          setError(message);
          toast.error(message);
          return;
        }
        const data = (await response.json()) as Lead[];
        setLeads(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load leads";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeads();
  }, []);

  return (
    <div className="p-3 max-w-6xl w-full mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <AddLeadDialog
          onLeadCreated={(lead) => setLeads((prev) => [lead, ...prev])}
        />
      </div>

      <Separator />

      {isLoading ? <LeadsSkeleton /> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className="p-5 cursor-pointer hover:shadow-md transition border-none bg-sidebar"
              onClick={() => (window.location.href = `/leads/${lead.id}`)}
            >
              <p className="font-medium text-sm">{lead.jobTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {lead.platform || "—"}
              </p>
              <p className="text-xs mt-2 text-primary">
                {formatStatus(lead.status)}
              </p>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
