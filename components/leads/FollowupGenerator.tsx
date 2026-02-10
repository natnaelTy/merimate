"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function FollowupGenerator({
  clientName,
  jobTitle,
}: {
  clientName: string;
  jobTitle: string;
}) {
  const [lastMessage, setLastMessage] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, jobTitle, lastMessage }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to generate follow-up");
      }

      const data = (await response.json()) as { message: string };
      setResult(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Last message from you</p>
        <Textarea
          value={lastMessage}
          onChange={(event) => setLastMessage(event.target.value)}
          placeholder="Paste your last message or summary."
        />
      </div>
      <Button onClick={generate} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate AI Follow-up"}
      </Button>
      {error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : null}
      {result ? (
        <div className="rounded-lg border border-border/60 bg-white/80 p-4 text-sm">
          {result}
        </div>
      ) : null}
    </div>
  );
}
