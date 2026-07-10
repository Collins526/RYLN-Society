import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MemberPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-12">
      <Card className="w-full max-w-3xl shadow-xl border-border/50">
        <CardHeader className="space-y-2 px-8 py-8 text-center">
          <CardTitle className="text-3xl">Member Dashboard</CardTitle>
          <CardDescription>
            Welcome to your member page. You can access programs, view announcements, and manage your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {user ? (
            <div className="space-y-4">
              <p className="text-lg">
                Hello, <span className="font-semibold">{user.fullName}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                You are logged in as <span className="font-medium">{user.email}</span>.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/gallery">
                  <Button variant="secondary">Browse Gallery</Button>
                </Link>
                <Button variant="outline" onClick={logout}>
                  Log out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">You are not logged in.</p>
              <Link href="/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
