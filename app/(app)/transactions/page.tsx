import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTransactionsForUser, countTransactionsForUser } from "@/lib/data/transactions";
import { getCategoriesForUser } from "@/lib/data/categories";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionPagination } from "@/components/transactions/transaction-pagination";
import { TRANSACTIONS_PAGE_SIZE as PAGE_SIZE } from "@/lib/constants";

type Props = {
  searchParams: Promise<{ q?: string; type?: string; category?: string; page?: string }>;
};

export default async function TransactionsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const userId = session.user.id;
  const page = Math.max(1, Number(params.page) || 1);

  const filters = {
    q: params.q,
    type: params.type as "INCOME" | "EXPENSE" | "ALL" | undefined,
    categoryId: params.category,
  };

  const [transactions, total, categories] = await Promise.all([
    getTransactionsForUser(userId, {
      ...filters,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    countTransactionsForUser(userId, filters),
    getCategoriesForUser(userId),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
      <TransactionFilters categories={categories} />
      <TransactionList transactions={transactions} categories={categories} />
      <TransactionPagination page={page} totalPages={totalPages} />
    </div>
  );
}
