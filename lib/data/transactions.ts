import { prisma } from "@/lib/prisma";
import type { Category, CategoryType, Prisma, Transaction } from "@prisma/client";

export type TransactionFilters = {
  q?: string;
  type?: CategoryType | "ALL";
  categoryId?: string | "ALL";
  take?: number;
  skip?: number;
};

export type SerializedTransaction = Omit<Transaction, "amount"> & {
  amount: number;
  category: Category;
};

function buildTransactionWhere(
  userId: string,
  filters: Pick<TransactionFilters, "q" | "type" | "categoryId">
): Prisma.TransactionWhereInput {
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

  return where;
}

export async function getTransactionsForUser(
  userId: string,
  filters: TransactionFilters
): Promise<SerializedTransaction[]> {
  const where = buildTransactionWhere(userId, filters);

  const rows = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
    ...(filters.take ? { take: filters.take } : {}),
    ...(filters.skip ? { skip: filters.skip } : {}),
  });

  // Prisma's Decimal instances can't cross the Server -> Client Component
  // boundary, so convert to plain numbers here at the data layer.
  return rows.map((row) => ({ ...row, amount: Number(row.amount) }));
}

export async function countTransactionsForUser(
  userId: string,
  filters: Pick<TransactionFilters, "q" | "type" | "categoryId">
): Promise<number> {
  const where = buildTransactionWhere(userId, filters);
  return prisma.transaction.count({ where });
}
