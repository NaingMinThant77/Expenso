"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Wallet, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionDialog } from "./transaction-dialog";
import { TransactionListItem } from "./transaction-list-item";
import { useOffline } from "@/context/offline-context";
import { filterLocalTransactions, paginateLocalTransactions } from "@/lib/offline/repository";
import { TRANSACTIONS_PAGE_SIZE } from "@/lib/constants";
import type { Category } from "@prisma/client";
import type { SerializedTransaction } from "@/lib/data/transactions";

type Props = {
  transactions: SerializedTransaction[];
  categories: Category[];
  /** Dashboard "recent transactions" usage: show at most this many, ignore URL filters/paging. */
  limit?: number;
};

export function TransactionList({ transactions, categories, limit }: Props) {
  const { transactions: localTransactions, isOnline, pendingCount, hydrateTransactions } =
    useOffline();
  const searchParams = useSearchParams();

  useEffect(() => {
    void hydrateTransactions(transactions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  // Prefer the server-rendered `transactions` prop whenever it's trustworthy
  // (online, nothing pending) — the local IndexedDB mirror is additive-only
  // and can't guarantee it holds the exact same set the server would.
  const useLocalView = !isOnline || pendingCount > 0;

  const displayTransactions = useMemo(() => {
    if (!useLocalView) return transactions;

    if (limit) {
      return filterLocalTransactions(localTransactions, {}).slice(0, limit);
    }

    const filtered = filterLocalTransactions(localTransactions, {
      q: searchParams.get("q") ?? undefined,
      type: (searchParams.get("type") as "INCOME" | "EXPENSE" | "ALL" | null) ?? undefined,
      categoryId: searchParams.get("category") ?? undefined,
    });
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    return paginateLocalTransactions(filtered, page, TRANSACTIONS_PAGE_SIZE);
  }, [useLocalView, transactions, localTransactions, searchParams, limit]);

  if (displayTransactions.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No transactions found"
        description="Log your first income or expense to start tracking your cash flow."
        action={
          <TransactionDialog
            categories={categories}
            trigger={
              <Button size="sm" className="mt-1">
                <Plus className="size-4" />
                Add Transaction
              </Button>
            }
          />
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {displayTransactions.map((transaction) => (
          <TransactionListItem
            key={transaction.id}
            transaction={transaction}
            categories={categories}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
