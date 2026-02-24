import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import { signInWithGoogle } from "@/app/(auth)/actions";
import { FcGoogle } from "react-icons/fc";
import SigninForm from "@/components/auth/SigninForm";



export default async function SignInPage({
  searchParams: _searchParams,
}: {
  searchParams?: { sent?: string; error?: string; email?: string };
}) {
  const supabase = await createServerSupabaseReadOnly();
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
        <CardTitle className="text-2xl">Sign in to your workspace</CardTitle>
        <p className="text-sm text-muted-foreground">
          Access your workspace with your email and password.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <SigninForm />
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
