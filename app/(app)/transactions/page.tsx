import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTransactionsForUser } from "@/lib/data/transactions";
import { getCategoriesForUser } from "@/lib/data/categories";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";

type Props = {
  searchParams: Promise<{ q?: string; type?: string; category?: string }>;
};

export default async function TransactionsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const userId = session.user.id;

  const [transactions, categories] = await Promise.all([
    getTransactionsForUser(userId, {
      q: params.q,
      type: params.type as "INCOME" | "EXPENSE" | "ALL" | undefined,
      categoryId: params.category,
    }),
    getCategoriesForUser(userId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
      <TransactionFilters categories={categories} />
      <TransactionList transactions={transactions} categories={categories} />
    </div>
  );
}
