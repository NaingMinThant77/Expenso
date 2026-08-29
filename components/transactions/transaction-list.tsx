"use client";

import { Wallet, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionDialog } from "./transaction-dialog";
import { TransactionListItem } from "./transaction-list-item";
import type { Category } from "@prisma/client";
import type { SerializedTransaction } from "@/lib/data/transactions";

type Props = {
  transactions: SerializedTransaction[];
  categories: Category[];
};

export function TransactionList({ transactions, categories }: Props) {
  if (transactions.length === 0) {
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
        {transactions.map((transaction) => (
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
