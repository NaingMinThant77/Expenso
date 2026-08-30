import { prisma } from "@/lib/prisma";
import type { SerializedTransaction } from "@/lib/data/transactions";

export type CalendarDay = {
  date: Date;
  day: number;
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
  transactions: SerializedTransaction[];
};

function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export async function getMonthCalendarData(
  userId: string,
  year: number,
  month: number,
) {
  const { start, end } = monthRange(year, month);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lt: end } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: new Date(year, month - 1, i + 1),
    day: i + 1,
    income: 0,
    expense: 0,
    incomeCount: 0,
    expenseCount: 0,
    transactions: [],
  }));

  for (const t of transactions) {
    const day = days[t.date.getDate() - 1];
    if (!day) continue;
    const amount = Number(t.amount);
    day.transactions.push({ ...t, amount });
    if (t.type === "INCOME") {
      day.income += amount;
      day.incomeCount += 1;
    } else {
      day.expense += amount;
      day.expenseCount += 1;
    }
  }

  const monthIncome = days.reduce((sum, d) => sum + d.income, 0);
  const monthExpense = days.reduce((sum, d) => sum + d.expense, 0);

  return { days, monthIncome, monthExpense };
}

export async function getPreviousMonthBalance(
  userId: string,
  year: number,
  month: number,
) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const { start, end } = monthRange(prevYear, prevMonth);

  const rows = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });

  const income = Number(
    rows.find((r) => r.type === "INCOME")?._sum.amount ?? 0,
  );
  const expense = Number(
    rows.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0,
  );

  return income - expense;
}
