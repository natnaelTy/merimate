"use client";

import { useMemo, useState } from "react";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FollowUpDraftProps = {
  message: string;
  clientName?: string | null;
  jobTitle?: string | null;
};

type ToolTask = "reply" | "grammar" | "professional";

export default function FollowUpDraft({
  message,
  clientName,
  jobTitle,
}: FollowUpDraftProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldClamp = useMemo(() => message.length > 240, [message.length]);
  const [replyInput, setReplyInput] = useState("");
  const [replyOutput, setReplyOutput] = useState("");
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [grammarInput, setGrammarInput] = useState("");
  const [grammarOutput, setGrammarOutput] = useState("");
  const [isGrammarLoading, setIsGrammarLoading] = useState(false);
  const [professionalInput, setProfessionalInput] = useState("");
  const [professionalOutput, setProfessionalOutput] = useState("");
  const [isProfessionalLoading, setIsProfessionalLoading] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const runTool = async (
    task: ToolTask,
    text: string,
    onResult: (value: string) => void,
    onLoading: (value: boolean) => void
  ) => {
    if (!text.trim()) {
      toast.error("Add text to continue");
      return;
    }

    onLoading(true);
    try {
      const response = await fetch("/api/ai/writing-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          text,
          clientName: clientName || undefined,
          jobTitle: jobTitle || undefined,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Failed to generate response");
      }

      const data = (await response.json()) as { output?: string };
      onResult((data.output || "").trim());
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI error";
      toast.error(message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-4 rounded-md border border-border/60 bg-background/60 p-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Draft response (due date)
            </p>
            <p className="text-xs text-muted-foreground">
              Ready-to-send message created when the follow-up was due.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {shouldClamp ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" /> View
                  </>
                )}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopy(message)}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          </div>
        </div>
        <p
          className={cn(
            "mt-2 whitespace-pre-wrap text-xs text-muted-foreground",
            shouldClamp && !isExpanded ? "line-clamp-3" : ""
          )}
        >
          {message}
        </p>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Reply generator</p>
          <p className="text-xs text-muted-foreground">
            Paste the client’s recent message to draft a quick reply.
          </p>
        </div>
        <Textarea
          placeholder="Paste the client’s recent message here..."
          value={replyInput}
          onChange={(event) => setReplyInput(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              runTool("reply", replyInput, setReplyOutput, setIsReplyLoading)
            }
            disabled={isReplyLoading}
          >
            {isReplyLoading ? "Generating..." : "Generate reply"}
          </Button>
          {replyOutput ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopy(replyOutput)}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy reply
            </Button>
          ) : null}
        </div>
        {replyOutput ? (
          <p className="rounded-md border border-border/70 bg-background/80 p-3 text-xs text-muted-foreground">
            {replyOutput}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Grammar corrector</p>
          <p className="text-xs text-muted-foreground">
            Fix grammar and spelling while keeping your tone.
          </p>
        </div>
        <Textarea
          placeholder="Paste a draft to correct..."
          value={grammarInput}
          onChange={(event) => setGrammarInput(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              runTool(
                "grammar",
                grammarInput,
                setGrammarOutput,
                setIsGrammarLoading
              )
            }
            disabled={isGrammarLoading}
          >
            {isGrammarLoading ? "Correcting..." : "Correct grammar"}
          </Button>
          {grammarOutput ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopy(grammarOutput)}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy corrected
            </Button>
          ) : null}
        </div>
        {grammarOutput ? (
          <p className="rounded-md border border-border/70 bg-background/80 p-3 text-xs text-muted-foreground">
            {grammarOutput}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Professional writer
          </p>
          <p className="text-xs text-muted-foreground">
            Rewrite a draft to sound polished and professional.
          </p>
        </div>
        <Textarea
          placeholder="Paste a draft to polish..."
          value={professionalInput}
          onChange={(event) => setProfessionalInput(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              runTool(
                "professional",
                professionalInput,
                setProfessionalOutput,
                setIsProfessionalLoading
              )
            }
            disabled={isProfessionalLoading}
          >
            {isProfessionalLoading ? "Rewriting..." : "Rewrite professionally"}
          </Button>
          {professionalOutput ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopy(professionalOutput)}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy rewrite
            </Button>
          ) : null}
        </div>
        {professionalOutput ? (
          <p className="rounded-md border border-border/70 bg-background/80 p-3 text-xs text-muted-foreground">
            {professionalOutput}
          </p>
        ) : null}
      </div>
    </div>
  );
}
