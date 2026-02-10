import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createServerSupabase } from "@/lib/supabase/server";
import { signUpWithEmail, signUpWithGoogle } from "@/app/(auth)/actions";

export default async function SignUpPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Merimate
        </p>
        <CardTitle className="text-2xl">Create your workspace</CardTitle>
        <p className="text-sm text-muted-foreground">
          Get started in minutes with email or Google sign-up.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={signUpWithEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@studio.com"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Email me a sign-up link
          </Button>
        </form>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <form action={signUpWithGoogle}>
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>
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
