"use client";

import { format } from "date-fns";
import {
  Banknote,
  Landmark,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";
import type { SerializedTransaction } from "@/lib/data/transactions";

type Props = {
  transaction: SerializedTransaction;
  icon: LucideIcon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
};

export function TransactionDetailDialog({
  transaction,
  icon: Icon,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isPending,
}: Props) {
  const { format: formatMoney } = useCurrency();
  const isExpense = transaction.type === "EXPENSE";
  const MethodIcon = transaction.method === "BANK" ? Landmark : Banknote;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-5 overflow-y-auto p-6 sm:max-w-lg">
        <DialogHeader className="items-center text-center">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${transaction.category.color}1a`,
              color: transaction.category.color,
              boxShadow: `inset 0 0 0 1px ${transaction.category.color}33`,
            }}
          >
            <Icon className="size-6" />
          </span>
          <DialogTitle className="text-lg">
            {transaction.shop || transaction.category.name}
          </DialogTitle>
          <DialogDescription asChild>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-base font-bold tabular-nums",
                isExpense
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
            >
              {isExpense ? "-" : "+"}
              {formatMoney(Number(transaction.amount))}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-3.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium">{transaction.category.name}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">
              {format(transaction.date, "PPP")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">
              {format(transaction.date, "h:mm a")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Method</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MethodIcon className="size-3.5" />
              {transaction.method === "BANK" ? "Bank" : "Cash"}
            </span>
          </div>
          {transaction.shop && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Shop</span>
              <span className="truncate font-medium">{transaction.shop}</span>
            </div>
          )}
        </div>

        {transaction.memo && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Memo
            </span>
            <p className="max-h-40 overflow-y-auto rounded-2xl border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap wrap-break-word">
              {transaction.memo}
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-row items-center justify-between gap-2">
          <Button
            variant="outline"
            className="h-11 flex-1 gap-2 text-base"
            disabled={isPending}
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="h-11 flex-1 gap-2 text-base"
            disabled={isPending}
            onClick={() => {
              onOpenChange(false);
              onDelete();
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
