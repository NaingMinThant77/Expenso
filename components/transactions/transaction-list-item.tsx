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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TransactionDialog } from "./transaction-dialog";
import { TransactionDetailDialog } from "./transaction-detail-dialog";
import { getIcon } from "@/lib/icon-map";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOffline } from "@/context/offline-context";
import type { Category } from "@prisma/client";
import type { SerializedTransaction } from "@/lib/data/transactions";

type Props = {
  transaction: SerializedTransaction;
  categories: Category[];
};

export function TransactionListItem({ transaction, categories }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { deleteTransaction } = useOffline();
  const Icon = getIcon(transaction.category.icon);
  const isExpense = transaction.type === "EXPENSE";

  function confirmDelete() {
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
      className="flex items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/40"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDetailOpen(true);
          }
        }}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
      >
        <span
          className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${transaction.category.color}1a`,
            color: transaction.category.color,
            boxShadow: `inset 0 0 0 1px ${transaction.category.color}33`,
          }}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {transaction.shop || transaction.category.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {transaction.category.name} · {format(transaction.date, "MMM d, yyyy")}
          </p>
          {transaction.memo && (
            <p
              className="mt-1 line-clamp-2 text-xs text-muted-foreground/80 italic"
              title={transaction.memo}
            >
              {transaction.memo}
            </p>
          )}
        </div>

        <p
          className={cn(
            "mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums whitespace-nowrap",
            isExpense
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          )}
        >
          {isExpense ? "-" : "+"}
          {formatCurrency(Number(transaction.amount))}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={isPending} className="mt-0.5">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteConfirmOpen(true)}>
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

      <TransactionDetailDialog
        transaction={transaction}
        icon={Icon}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteConfirmOpen(true)}
        isPending={isPending}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              {transaction.shop || `this ${transaction.category.name.toLowerCase()} entry`}. This
              action can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
