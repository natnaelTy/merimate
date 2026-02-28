import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignupForm from "@/components/auth/SignupForm";

export default function WaitlistPage() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Merimate
        </p>
        <CardTitle className="text-2xl">Join the waitlist</CardTitle>
        <p className="text-sm text-muted-foreground">
          The beta is currently full. Join the waitlist and we&apos;ll notify you
          when a spot opens.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <SignupForm betaOpen={false} spotsLeft={0} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Already have access?</span>
          <Link href="/signup" className="font-medium text-foreground">
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
