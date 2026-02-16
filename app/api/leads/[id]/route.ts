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
	description: string | null;
	proposal: string | null;
	createdAt: string;
	updatedAt: string;
};

const validStatuses = new Set<ApiLeadStatus>([
	"new",
	"proposal",
	"waiting",
	"follow-up",
	"won",
	"lost",
]);

const apiToDbStatus: Record<ApiLeadStatus, DbLeadStatus> = {
	new: "NEW",
	proposal: "PROPOSAL",
	waiting: "WAITING",
	"follow-up": "FOLLOW_UP",
	won: "WON",
	lost: "LOST",
};

const dbToApiStatus: Record<DbLeadStatus, ApiLeadStatus> = {
	NEW: "new",
	PROPOSAL: "proposal",
	WAITING: "waiting",
	FOLLOW_UP: "follow-up",
	WON: "won",
	LOST: "lost",
};

const normalizeText = (value: unknown) =>
	typeof value === "string" ? value.trim() : "";

const emptyToNull = (value: unknown) => {
	const normalized = normalizeText(value);
	return normalized.length ? normalized : null;
};

const toLeadResponse = (lead: LeadRecord) => ({
	id: lead.id,
	clientName: lead.clientName,
	jobTitle: lead.jobTitle,
	platform: lead.platform,
	status: dbToApiStatus[lead.status],
	lastContact: lead.lastContact,
	notes: lead.notes,
	description: lead.description,
	proposal: lead.proposal,
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

export async function GET(
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

	const { data, error } = await supabase
		.from("leads")
		.select("id, clientName, jobTitle, platform, status, lastContact, notes, description, proposal, createdAt, updatedAt")
		.eq("id", leadId)
		.eq("userId", userId)
		.single();

	if (error || !data) {
		return NextResponse.json({ error: "Lead not found" }, { status: 404 });
	}

	return NextResponse.json(toLeadResponse(data as LeadRecord));
}

export async function PATCH(
	request: Request,
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

	let body: {
		clientName?: unknown;
		jobTitle?: unknown;
		platform?: unknown;
		status?: unknown;
		lastContact?: unknown;
		description?: unknown;
		jobDescription?: unknown;
		notes?: unknown;
		proposal?: unknown;
	};

	try {
		body = (await request.json()) as typeof body;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const patch: Record<string, string | null> = {};

	if (Object.prototype.hasOwnProperty.call(body, "clientName")) {
		const clientName = normalizeText(body.clientName);
		if (!clientName) {
			return NextResponse.json({ error: "clientName cannot be empty" }, { status: 400 });
		}
		patch.clientName = clientName;
	}

	if (Object.prototype.hasOwnProperty.call(body, "jobTitle")) {
		const jobTitle = normalizeText(body.jobTitle);
		if (!jobTitle) {
			return NextResponse.json({ error: "jobTitle cannot be empty" }, { status: 400 });
		}
		patch.jobTitle = jobTitle;
	}

	if (Object.prototype.hasOwnProperty.call(body, "platform")) {
		patch.platform = emptyToNull(body.platform);
	}

	if (Object.prototype.hasOwnProperty.call(body, "status")) {
		const status = normalizeText(body.status);
		if (!validStatuses.has(status as ApiLeadStatus)) {
			return NextResponse.json(
				{ error: "status must be one of: new, proposal, waiting, follow-up, won, lost" },
				{ status: 400 }
			);
		}
		patch.status = apiToDbStatus[status as ApiLeadStatus];
	}

	if (Object.prototype.hasOwnProperty.call(body, "lastContact")) {
		patch.lastContact = emptyToNull(body.lastContact);
	}

	if (Object.prototype.hasOwnProperty.call(body, "proposal")) {
		patch.proposal = emptyToNull(body.proposal);
	}

	const notesValue =
		emptyToNull(body.notes) ??
		emptyToNull(body.description) ??
		emptyToNull(body.jobDescription);

	if (Object.prototype.hasOwnProperty.call(body, "notes") ||
		Object.prototype.hasOwnProperty.call(body, "description") ||
		Object.prototype.hasOwnProperty.call(body, "jobDescription")) {
		patch.notes = notesValue;
	}

	if (Object.keys(patch).length === 0) {
		return NextResponse.json(
			{ error: "Provide at least one valid field to update" },
			{ status: 400 }
		);
	}

	const { data, error } = await supabase
		.from("leads")
		.update(patch)
		.eq("id", leadId)
		.eq("userId", userId)
		.select("id, clientName, jobTitle, platform, status, lastContact, notes, description, proposal, createdAt, updatedAt")
		.single();

	if (error || !data) {
		return NextResponse.json({ error: "Lead not found" }, { status: 404 });
	}

	return NextResponse.json(toLeadResponse(data as LeadRecord));
}

export async function DELETE(
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

	const { data, error } = await supabase
		.from("leads")
		.delete()
		.eq("id", leadId)
		.eq("userId", userId)
		.select("id")
		.single();

	if (error || !data) {
		return NextResponse.json({ error: "Lead not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
