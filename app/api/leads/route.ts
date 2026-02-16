import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
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
	createdAt: string;
	updatedAt: string;
};

type ReminderRecord = {
	leadId: string;
	reminderAt: string;
};


const normalizeText = (value: unknown) =>
	typeof value === "string" ? value.trim() : "";

const emptyToNull = (value: unknown) => {
	const normalized = normalizeText(value);
	return normalized.length ? normalized : null;
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

const toLeadResponse = (lead: LeadRecord) => ({
	id: lead.id,
	clientName: lead.clientName,
	jobTitle: lead.jobTitle,
	platform: lead.platform,
	status: dbToApiStatus[lead.status],
	lastContact: lead.lastContact,
	notes: lead.notes,
	description: lead.description,
	createdAt: lead.createdAt,
	updatedAt: lead.updatedAt,
});

async function getCurrentUserId() {
	const supabase = await createServerSupabase();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return { supabase, user: user ?? null, userId: user?.id ?? null };
}

async function ensureUserRow(
	supabase: Awaited<ReturnType<typeof createServerSupabase>>,
	user: User
) {
	const email = user.email ?? `${user.id}@no-email.local`;

	const attempts = [
		{
			table: "users",
			payload: { id: user.id, email },
		},
		{
			table: "User",
			payload: { id: user.id, email },
		},
	] as const;

	for (const attempt of attempts) {
		const { error } = await supabase
			.from(attempt.table)
			.upsert(attempt.payload, { onConflict: "id" });

		if (!error) {
			return;
		}

		// Ignore missing-table errors and keep trying fallback table names.
		if (error.code === "42P01") {
			continue;
		}

		throw new Error(error.message);
	}
}

export async function GET() {
	const { supabase, userId } = await getCurrentUserId();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data, error } = await supabase
		.from("leads")
		.select("id, clientName, jobTitle, platform, status, lastContact, notes, description, createdAt, updatedAt")
		.eq("userId", userId)
		.order("updatedAt", { ascending: false });

	if (error) {
		return NextResponse.json(
			{
				error: "Failed to load leads",
				detail: error.message,
			},
			{ status: 500 }
		);
	}

	const leads = (data as LeadRecord[]) ?? [];
	const leadIds = leads.map((lead) => lead.id);
	const remindersByLead = new Map<string, string>();

	if (leadIds.length > 0) {
		const { data: reminders, error: remindersError } = await supabase
			.from("reminders")
			.select("leadId, reminderAt")
			.eq("userId", userId)
			.eq("sent", false)
			.in("leadId", leadIds)
			.order("reminderAt", { ascending: true });

		if (remindersError) {
			return NextResponse.json(
				{
					error: "Failed to load reminders",
					detail: remindersError.message,
				},
				{ status: 500 }
			);
		}

		for (const reminder of (reminders as ReminderRecord[]) ?? []) {
			if (!remindersByLead.has(reminder.leadId)) {
				remindersByLead.set(reminder.leadId, reminder.reminderAt);
			}
		}
	}

	const response = leads.map((lead) => ({
		...toLeadResponse(lead),
		nextReminderAt: remindersByLead.get(lead.id) ?? null,
	}));

	return NextResponse.json(response);
}

export async function POST(request: Request) {
	const { supabase, user, userId } = await getCurrentUserId();

	if (!user || !userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await ensureUserRow(supabase, user);
	} catch (error) {
		return NextResponse.json(
			{
				error: "Failed to prepare user record",
				detail: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}

	let body: {
		clientName?: unknown;
		jobTitle?: unknown;
		platform?: unknown;
		status?: unknown;
		lastContact?: unknown;
		jobDescription?: unknown;
	};

	try {
		body = (await request.json()) as typeof body;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const jobTitle = normalizeText(body.jobTitle);
	if (!jobTitle) {
		return NextResponse.json({ error: "jobTitle is required" }, { status: 400 });
	}

	const clientName = normalizeText(body.clientName) || "Unknown";
	const status = normalizeText(body.status) || "new";

	if (!validStatuses.has(status as ApiLeadStatus)) {
		return NextResponse.json(
			{ error: "status must be one of: new, proposal, waiting, follow-up, won, lost" },
			{ status: 400 }
		);
	}


	const payload = {
		id: crypto.randomUUID(),
		userId,
		clientName,
		jobTitle,
		platform: emptyToNull(body.platform),
		status: apiToDbStatus[status as ApiLeadStatus],
		lastContact: emptyToNull(body.lastContact),
		description: emptyToNull(body.jobDescription),
		updatedAt: new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from("leads")
		.insert(payload)
		.select("id, clientName, jobTitle, platform, status, lastContact, notes, description, createdAt, updatedAt")
		.single();

	if (error || !data) {
		return NextResponse.json(
			{
				error: "Failed to create lead",
				detail: error?.message || "Unknown database error",
			},
			{ status: 500 }
		);
	}

	return NextResponse.json(toLeadResponse(data as LeadRecord), { status: 201 });
}
