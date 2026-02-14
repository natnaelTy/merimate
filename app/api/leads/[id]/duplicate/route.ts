import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

type ApiLeadStatus = "new" | "proposal" | "waiting" | "follow-up" | "won" | "lost";
type DbLeadStatus = "NEW" | "PROPOSAL" | "WAITING" | "FOLLOW_UP" | "WON" | "LOST";

type LeadRecord = {
	id: string;
	clientName: string;
	jobTitle: string;
	platform: string | null;
	status: DbLeadStatus;
	lastContact: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
};

const dbToApiStatus: Record<DbLeadStatus, ApiLeadStatus> = {
	NEW: "new",
	PROPOSAL: "proposal",
	WAITING: "waiting",
	FOLLOW_UP: "follow-up",
	WON: "won",
	LOST: "lost",
};

const toLeadResponse = (lead: LeadRecord) => ({
	id: lead.id,
	clientName: lead.clientName,
	jobTitle: lead.jobTitle,
	platform: lead.platform,
	status: dbToApiStatus[lead.status],
	lastContact: lead.lastContact,
	notes: lead.notes,
	createdAt: lead.createdAt,
	updatedAt: lead.updatedAt,
});

async function getCurrentUserId() {
	const supabase = await createServerSupabase();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return { supabase, userId: user?.id ?? null };
}

function parseId(params: { id?: string }) {
	const id = params.id?.trim();
	return id || null;
}

export async function POST(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { supabase, userId } = await getCurrentUserId();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const params = await context.params;
	const leadId = parseId(params);

	if (!leadId) {
		return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
	}

	const { data: original, error: fetchError } = await supabase
		.from("leads")
		.select("id, clientName, jobTitle, platform, status, lastContact, notes, createdAt, updatedAt")
		.eq("id", leadId)
		.eq("userId", userId)
		.single();

	if (fetchError || !original) {
		return NextResponse.json({ error: "Lead not found" }, { status: 404 });
	}

	const now = new Date().toISOString();
	const payload = {
		id: crypto.randomUUID(),
		userId,
		clientName: original.clientName,
		jobTitle: `${original.jobTitle} (Copy)`,
		platform: original.platform,
		status: "NEW",
		lastContact: original.lastContact,
		notes: original.notes,
		updatedAt: now,
	};

	const { data, error } = await supabase
		.from("leads")
		.insert(payload)
		.select("id, clientName, jobTitle, platform, status, lastContact, notes, createdAt, updatedAt")
		.single();

	if (error || !data) {
		return NextResponse.json(
			{ error: "Failed to duplicate lead", detail: error?.message },
			{ status: 500 }
		);
	}

	return NextResponse.json(toLeadResponse(data as LeadRecord), { status: 201 });
}