import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";

type GetUserOptions = {
	redirectTo?: string;
	allowAnonymous?: boolean;
};

type GetUserProps = GetUserOptions & {
	children: (user: User) => ReactNode;
};

export async function getAuthenticatedUser(
	options: GetUserOptions = {}
): Promise<User | null> {
	const { redirectTo = "/signin", allowAnonymous = false } = options;
	const supabase = await createServerSupabaseReadOnly();
	const { data, error } = await supabase.auth.getUser();
	const user = data.user ?? null;

	if (!user && !allowAnonymous) {
		redirect(redirectTo);
	}

	if (error) {
		return null;
	}

	return user;
}

export default async function GetUser({
	children,
	redirectTo = "/signin",
	allowAnonymous = false,
}: GetUserProps) {
	const user = await getAuthenticatedUser({ redirectTo, allowAnonymous });

	if (!user) return null;

	return <>{children(user)}</>;
}
