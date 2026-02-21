import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import { signInWithEmail, signInWithGoogle } from "@/app/(auth)/actions";
import { FcGoogle } from "react-icons/fc";



export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { sent?: string; error?: string; email?: string };
}) {
  const supabase = await createServerSupabaseReadOnly();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect("/dashboard");
  }

  const sent = searchParams?.sent === "1";
  const error = searchParams?.error;
  const email = searchParams?.email;

  return (
    <Card>
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Merimate
        </p>
        <CardTitle className="text-2xl">Sign in to your workspace</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick up the thread on every lead with a quick sign-in link.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sent ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            We sent a sign-in link to {email || "your email"}.
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <form action={signInWithEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
            />
          </div>
          <Button type="submit" className="w-full">
          Sign in
          </Button>
        </form>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full">
          <FcGoogle className="mr-2 h-4 w-4" />  Continue with Google 
          </Button>
        </form>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Need an account?</span>
          <Link href="/signup" className="font-medium text-foreground">
            Create one
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
