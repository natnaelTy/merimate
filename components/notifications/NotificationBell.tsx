"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationItem = {
  id: string;
  leadId: string;
  reminderAt: string;
  message: string | null;
  clientName: string | null;
  jobTitle: string | null;
};

const POLL_INTERVAL_MS = 60_000;

const formatLeadLabel = (item: NotificationItem) => {
  const label = [item.clientName, item.jobTitle].filter(Boolean).join(" - ");
  return label || "Lead follow-up";
};

const formatDueLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "now" : format(date, "PPP");
};

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=8", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as { items?: NotificationItem[] };
      const nextItems = data.items ?? [];
      const newItems = nextItems.filter(
        (item) => !seenIdsRef.current.has(item.id)
      );

      if (newItems.length > 0) {
        const nextDue = newItems[0];
        const dueLabel = formatDueLabel(nextDue.reminderAt);
        const description =
          newItems.length === 1
            ? `${formatLeadLabel(nextDue)} due ${dueLabel}.`
            : `${newItems.length} follow-ups due. Next: ${dueLabel}.`;

        toast.warning("Follow-up due", { description });
      }

      seenIdsRef.current = new Set(nextItems.map((item) => item.id));
      if (isMountedRef.current) {
        setItems(nextItems);
      }
    } catch {
      // Ignore polling failures.
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void loadNotifications();
    const timer = setInterval(() => {
      void loadNotifications();
    }, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
    };
  }, [loadNotifications]);

  const count = items.length;
  const countLabel = count > 9 ? "9+" : String(count);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
              {countLabel}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {isLoading ? (
            <span className="text-xs text-muted-foreground">Refreshing...</span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            No due reminders.
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link
                href={`/leads/${item.leadId}`}
                className="flex flex-col gap-1"
              >
                <span className="text-sm font-medium">
                  {formatLeadLabel(item)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Due {formatDueLabel(item.reminderAt)}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/follow-ups" className="text-sm">
            Open follow-ups
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
