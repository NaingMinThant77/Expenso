import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { getTransactionsForUser } from "@/lib/data/transactions";
import { getCategoriesForUser } from "@/lib/data/categories";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [summary, recentTransactions, categories] = await Promise.all([
    getDashboardSummary(userId),
    getTransactionsForUser(userId, { take: 5 }),
    getCategoriesForUser(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      </div>

      <SummaryCards {...summary} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Recent transactions</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions">View all</Link>
          </Button>
        </div>
        <TransactionList transactions={recentTransactions} categories={categories} />
      </div>
    </div>
  );
}
