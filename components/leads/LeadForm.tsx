import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadStatus } from "@/types/lead";

const statuses: LeadStatus[] = [
  "new",
  "proposal",
  "waiting",
  "follow-up",
  "won",
  "lost",
];

export type LeadFormValues = {
  clientName?: string;
  jobTitle?: string;
  platform?: string | null;
  status?: LeadStatus;
  lastContact?: string | null;
  notes?: string | null;
};

export default function LeadForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: LeadFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client name</Label>
          <Input
            id="clientName"
            name="clientName"
            defaultValue={defaultValues?.clientName ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job title</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            defaultValue={defaultValues?.jobTitle ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <input
            type="hidden"
            id="platform"
            name="platform"
            defaultValue={defaultValues?.platform ?? ""}
          />
          <Select defaultValue={defaultValues?.platform ?? ""}>
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
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "new"}
            className="h-10 w-full rounded-lg border px-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastContact">Last contact</Label>
          <Input
            id="lastContact"
            name="lastContact"
            type="date"
            defaultValue={defaultValues?.lastContact ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Job description</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Full job description for this lead."
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
