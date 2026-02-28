import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { BETA_USER_LIMIT } from "@/lib/beta";
import { signUpWithGoogle } from "@/app/(auth)/actions";
import SignupForm from "@/components/auth/SignupForm";
import { FcGoogle } from "react-icons/fc";


export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: { waitlist?: string };
}) {
  const supabase = await createServerSupabaseReadOnly();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect("/dashboard");
  }

  let betaOpen = true;
  let spotsLeft: number | null = null;

  try {
    const admin = createAdminSupabase();
    const { count, error } = await admin
      .from("users")
      .select("id", { count: "exact", head: true });

    if (!error) {
      const used = count ?? 0;
      spotsLeft = Math.max(0, BETA_USER_LIMIT - used);
      betaOpen = spotsLeft > 0;
    }
  } catch {
    betaOpen = false;
    spotsLeft = 0;
  }

  if (searchParams?.waitlist === "1") {
    betaOpen = false;
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Merimate
        </p>
        <CardTitle className="text-2xl">
          {betaOpen ? "Create your workspace" : "Join the waitlist"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {betaOpen
            ? "Get started in minutes with email or Google sign-up."
            : "The beta is full. Join the waitlist and we'll notify you when a spot opens."}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <SignupForm betaOpen={betaOpen} spotsLeft={spotsLeft} />
        {betaOpen ? (
          <>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <form action={signUpWithGoogle}>
              <Button type="submit" variant="outline" className="w-full">
                <FcGoogle className="h-5 w-5 mr-1" /> Continue with Google
              </Button>
            </form>
          </>
        ) : null}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Already have an account?</span>
          <Link href="/signin" className="font-medium text-foreground">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
