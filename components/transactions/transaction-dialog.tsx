"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import type { Category } from "@prisma/client";

type TransactionProp = ComponentProps<typeof TransactionForm>["transaction"];

type Props = {
  categories: Category[];
  transaction?: TransactionProp;
  defaultDate?: Date;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TransactionDialog({
  categories,
  transaction,
  defaultDate,
  trigger,
  open,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] gap-5 overflow-y-auto p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {transaction ? "Edit transaction" : "New transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update the details of this transaction."
              : "Log a new expense or income entry."}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          categories={categories}
          transaction={transaction}
          defaultDate={defaultDate}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
