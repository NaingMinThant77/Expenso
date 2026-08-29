"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TransactionDialog } from "./transaction-dialog";
import { getIcon } from "@/lib/icon-map";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteTransaction } from "@/lib/actions/transactions";
import type { Category } from "@prisma/client";
import type { SerializedTransaction } from "@/lib/data/transactions";

type Props = {
  transaction: SerializedTransaction;
  categories: Category[];
};

export function TransactionListItem({ transaction, categories }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const Icon = getIcon(transaction.category.icon);
  const isExpense = transaction.type === "EXPENSE";

  function handleDelete() {
    if (!window.confirm("Delete this transaction?")) return;
    startTransition(async () => {
      const result = await deleteTransaction(transaction.id);
      if (result?.error) {
        toast.error(typeof result.error === "string" ? result.error : "Couldn't delete");
        return;
      }
      toast.success("Transaction deleted");
    });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${transaction.category.color}1a`, color: transaction.category.color }}
      >
        <Icon className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {transaction.shop || transaction.category.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {transaction.category.name} · {format(transaction.date, "MMM d, yyyy")}
          {transaction.memo ? ` · ${transaction.memo}` : ""}
        </p>
      </div>

      <p
        className={cn(
          "shrink-0 text-sm font-semibold",
          isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {isExpense ? "-" : "+"}
        {formatCurrency(Number(transaction.amount))}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={isPending}>
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransactionDialog
        categories={categories}
        transaction={{
          id: transaction.id,
          type: transaction.type,
          amount: Number(transaction.amount),
          method: transaction.method,
          categoryId: transaction.categoryId,
          date: transaction.date,
          shop: transaction.shop,
          memo: transaction.memo,
        }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </motion.div>
  );
}
