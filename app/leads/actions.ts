"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { LeadStatus } from "@/types/lead";

const normalize = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const parseLeadPayload = (formData: FormData) => ({
  client_name: normalize(formData.get("clientName")),
  job_title: normalize(formData.get("jobTitle")),
  platform: normalize(formData.get("platform")) || null,
  status: (normalize(formData.get("status")) || "new") as LeadStatus,
  last_contact: normalize(formData.get("lastContact")) || null,
  notes: normalize(formData.get("notes")) || null,
});

export async function createLead(formData: FormData) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const payload = parseLeadPayload(formData);

  await supabase.from("leads").insert({
    ...payload,
    user_id: user.id,
  });

  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function createLeadFromProposal(formData: FormData) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const clientName = normalize(formData.get("clientName"));
  const jobTitle = normalize(formData.get("jobTitle"));
  const platform = normalize(formData.get("platform")) || null;
  const jobDescription = normalize(formData.get("jobDescription"));
  const proposal = normalize(formData.get("proposal"));
  const extraContext = normalize(formData.get("extraContext"));

  if (!clientName || !jobTitle || !jobDescription || !proposal) {
    return;
  }

  const notes = [
    `Job description:\n${jobDescription}`,
    extraContext ? `Extra context:\n${extraContext}` : "",
    `Proposal:\n${proposal}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  await supabase.from("leads").insert({
    user_id: user.id,
    client_name: clientName,
    job_title: jobTitle,
    platform,
    status: "proposal",
    last_contact: new Date().toISOString().slice(0, 10),
    notes,
  });

  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function updateLead(formData: FormData) {
  const id = normalize(formData.get("id"));
  if (!id) return;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const payload = parseLeadPayload(formData);

  await supabase
    .from("leads")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteLead(formData: FormData) {
  const id = normalize(formData.get("id"));
  if (!id) return;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  await supabase.from("leads").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/leads");
  revalidatePath("/dashboard");
}
