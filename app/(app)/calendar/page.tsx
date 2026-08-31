import { redirect } from "next/navigation";
import { CalendarDays, PieChart } from "lucide-react";
import { auth } from "@/auth";
import {
  getMonthCalendarData,
  getPreviousMonthBalance,
} from "@/lib/data/calendar";
import {
  getCategoryBreakdown,
  getIncomeExpenseTrend,
} from "@/lib/data/reports";
import { getCategoriesForUser } from "@/lib/data/categories";
import { MonthNav } from "@/components/calendar/month-nav";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CategoryDonutChart } from "@/components/calendar/category-donut-chart";
import { IncomeExpenseChart } from "@/components/calendar/income-expense-chart";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function CalendarPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;
  const userId = session.user.id;

  const [
    { days, monthIncome, monthExpense },
    previousBalance,
    categoryBreakdown,
    trend,
    categories,
  ] = await Promise.all([
    getMonthCalendarData(userId, year, month),
    getPreviousMonthBalance(userId, year, month),
    getCategoryBreakdown(userId, year, month),
    getIncomeExpenseTrend(userId, year, month),
    getCategoriesForUser(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="size-4" />
          Daily income &amp; expense calendar
        </div>
        {/* <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 text-sm">
          <span className="text-muted-foreground">Previous month :</span>
          <span
            className={cn(
              "font-semibold",
              previousBalance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {formatCurrency(previousBalance)}
          </span>
        </div> */}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <MonthNav
            year={year}
            month={month}
            monthIncome={monthIncome}
            monthExpense={monthExpense}
          />
        </div>

        <CalendarGrid
          year={year}
          month={month}
          days={days}
          categories={categories}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <PieChart className="size-4" />
          Category breakdown &amp; trends
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-sm font-semibold">Category Distribution</h2>
            <CategoryDonutChart slices={categoryBreakdown} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-sm font-semibold">Income vs Expenses</h2>
            <IncomeExpenseChart points={trend} />
          </div>
        </div>
      </div>
    </div>
  );
}
