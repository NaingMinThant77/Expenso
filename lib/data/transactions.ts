import { prisma } from "@/lib/prisma";
import type { Category, CategoryType, Prisma, Transaction } from "@prisma/client";

export type TransactionFilters = {
  q?: string;
  type?: CategoryType | "ALL";
  categoryId?: string | "ALL";
  take?: number;
};

export type SerializedTransaction = Omit<Transaction, "amount"> & {
  amount: number;
  category: Category;
};

export async function getTransactionsForUser(
  userId: string,
  filters: TransactionFilters
): Promise<SerializedTransaction[]> {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.type && filters.type !== "ALL") {
    where.type = filters.type;
  }
  if (filters.categoryId && filters.categoryId !== "ALL") {
    where.categoryId = filters.categoryId;
  }
  if (filters.q) {
    where.OR = [
      { shop: { contains: filters.q, mode: "insensitive" } },
      { memo: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
    ...(filters.take ? { take: filters.take } : {}),
  });

  // Prisma's Decimal instances can't cross the Server -> Client Component
  // boundary, so convert to plain numbers here at the data layer.
  return rows.map((row) => ({ ...row, amount: Number(row.amount) }));
}
