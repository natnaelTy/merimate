"use client";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LeadForm from "@/components/leads/LeadForm";
import { createLead } from "@/app/leads/actions";

export default function LeadCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">New lead</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
          <DialogDescription>
            Capture the basics and follow up when it matters.
          </DialogDescription>
        </DialogHeader>
        <LeadForm action={createLead} submitLabel="Create lead" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
