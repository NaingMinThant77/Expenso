import { prisma } from "@/lib/prisma";
import type { PaymentMethod, CategoryType } from "@prisma/client";

export async function getDashboardSummary(userId: string) {
  const rows = await prisma.transaction.groupBy({
    by: ["method", "type"],
    where: { userId },
    _sum: { amount: true },
  });

  const sum = (method: PaymentMethod, type: CategoryType) =>
    Number(
      rows.find((r) => r.method === method && r.type === type)?._sum.amount ?? 0
    );

  const cashIncome = sum("CASH", "INCOME");
  const cashExpense = sum("CASH", "EXPENSE");
  const bankIncome = sum("BANK", "INCOME");
  const bankExpense = sum("BANK", "EXPENSE");

  return {
    totalIncome: cashIncome + bankIncome,
    totalExpense: cashExpense + bankExpense,
    cashBalance: cashIncome - cashExpense,
    bankBalance: bankIncome - bankExpense,
    netBalance: cashIncome + bankIncome - cashExpense - bankExpense,
  };
}
