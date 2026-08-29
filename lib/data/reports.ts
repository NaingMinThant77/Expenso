import { prisma } from "@/lib/prisma";

export type CategorySlice = {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  percent: number;
};

function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export async function getCategoryBreakdown(
  userId: string,
  year: number,
  month: number
): Promise<CategorySlice[]> {
  const { start, end } = monthRange(year, month);

  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
    _sum: { amount: true },
  });

  if (rows.length === 0) return [];

  const categories = await prisma.category.findMany({
    where: { id: { in: rows.map((r) => r.categoryId) } },
  });

  const total = rows.reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0);

  return rows
    .map((r) => {
      const category = categories.find((c) => c.id === r.categoryId);
      const amount = Number(r._sum.amount ?? 0);
      return {
        categoryId: r.categoryId,
        name: category?.name ?? "Unknown",
        color: category?.color ?? "#6b7280",
        icon: category?.icon ?? "more-horizontal",
        total: amount,
        percent: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export type MonthlyTrendPoint = {
  label: string;
  income: number;
  expense: number;
};

export async function getIncomeExpenseTrend(
  userId: string,
  year: number,
  month: number,
  monthsBack = 6
): Promise<MonthlyTrendPoint[]> {
  const points: MonthlyTrendPoint[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const { start, end } = monthRange(d.getFullYear(), d.getMonth() + 1);

    const rows = await prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    points.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      income: Number(rows.find((r) => r.type === "INCOME")?._sum.amount ?? 0),
      expense: Number(rows.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0),
    });
  }

  return points;
}
