
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const supabase = await createServerSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ token: data.session.access_token });
}
