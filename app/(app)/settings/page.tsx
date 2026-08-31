import Link from "next/link";
import { redirect } from "next/navigation";
import { Tags, ChevronRight, TriangleAlert } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { CurrencySelect } from "@/components/settings/currency-select";
import { LogoutButton } from "@/components/settings/logout-button";
import { OfflineStatusCard } from "@/components/settings/offline-status-card";
import { PushReminderToggle } from "@/components/settings/push-reminder-toggle";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <ProfileForm
        username={user.username}
        email={user.email}
        image={user.image}
        memberSince={user.createdAt}
      />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencySelect />
        </CardContent>
      </Card>

      <Link
        href="/settings/categories"
        className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/50"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground">
          <Tags className="size-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">Categories</p>
          <p className="text-xs text-muted-foreground">
            Manage expense and income categories
          </p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>

      <PushReminderToggle />

      <OfflineStatusCard />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Log out of Expenso?</p>
              <p className="text-xs text-muted-foreground">
                You&apos;ll need to sign in again to see your transactions and
                dashboard.
              </p>
            </div>
          </div>
          <div className="self-end sm:self-auto">
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
