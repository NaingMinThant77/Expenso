"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { getIcon } from "@/lib/icon-map";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";
import type { SerializedTransaction } from "@/lib/data/transactions";

type Props = {
  date: Date;
  transactions: SerializedTransaction[];
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DayDetailDialog({ date, transactions, categories, open, onOpenChange }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </DialogTitle>
            <DialogDescription>
              {transactions.length === 0
                ? "No transactions on this day yet."
                : `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {transactions.map((t) => {
              const Icon = getIcon(t.category.icon);
              const isExpense = t.type === "EXPENSE";
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${t.category.color}1a`, color: t.category.color }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.shop || t.category.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.category.name}</p>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 text-sm font-semibold",
                      isExpense
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {isExpense ? "-" : "+"}
                    {formatCurrency(t.amount)}
                  </p>
                </div>
              );
            })}
          </div>

          <Button className="mt-2 w-full" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add transaction for this day
          </Button>
        </DialogContent>
      </Dialog>

      <TransactionDialog
        categories={categories}
        defaultDate={date}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </>
  );
}
