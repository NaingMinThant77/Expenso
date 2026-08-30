"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Banknote, Landmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icon-map";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import { useOffline } from "@/context/offline-context";
import type { Category } from "@prisma/client";

type Props = {
  categories: Category[];
  transaction?: {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    method: "CASH" | "BANK";
    categoryId: string;
    date: Date;
    shop?: string | null;
    memo?: string | null;
  };
  defaultDate?: Date;
  onSuccess: () => void;
};

export function TransactionForm({ categories, transaction, defaultDate, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const { createTransaction, updateTransaction } = useOffline();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionInput>,
    defaultValues: transaction
      ? { ...transaction, shop: transaction.shop ?? "", memo: transaction.memo ?? "" }
      : {
          type: "EXPENSE",
          method: "CASH",
          date: defaultDate ?? new Date(),
          amount: undefined,
          categoryId: "",
          shop: "",
          memo: "",
        },
  });

  const type = watch("type");
  const method = watch("method");
  const categoryId = watch("categoryId");

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  useEffect(() => {
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setValue("categoryId", filteredCategories[0]?.id ?? "");
    }
  }, [type, filteredCategories, categoryId, setValue]);

  function onSubmit(values: TransactionInput) {
    startTransition(async () => {
      // Store the calendar day the user picked (in their local timezone) as a
      // timezone-agnostic UTC-midnight instant, so server-side day bucketing
      // (which reads with getUTC*) always lands on the same day.
      const normalized = {
        ...values,
        date: new Date(
          Date.UTC(values.date.getFullYear(), values.date.getMonth(), values.date.getDate())
        ),
      };
      const result = transaction
        ? await updateTransaction(transaction.id, normalized)
        : await createTransaction(normalized);

      if (result?.error) {
        toast.error(
          typeof result.error === "string" ? result.error : "Please check the form and try again"
        );
        return;
      }

      toast.success(transaction ? "Transaction updated" : "Transaction added");
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1.5">
        {(["EXPENSE", "INCOME"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue("type", t)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
              type === t ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {type === t && (
              <motion.div
                layoutId="transaction-type-pill"
                className="absolute inset-0 rounded-full bg-linear-to-b from-primary to-(--primary-shadow) shadow-[0_0_20px_-6px_var(--primary-glow)]"
                transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{t === "EXPENSE" ? "Expense" : "Income"}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            className="pl-8 pr-4"
            {...register("amount")}
          />
        </div>
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Payment method</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue("method", "CASH")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              method === "CASH"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            <Banknote className="size-4" />
            Cash
          </button>
          <button
            type="button"
            onClick={() => setValue("method", "BANK")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              method === "BANK"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            <Landmark className="size-4" />
            Bank
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => {
                  const Icon = getIcon(category.icon);
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <span
                        className="flex size-5 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${category.color}1a`, color: category.color }}
                      >
                        <Icon className="size-3" />
                      </span>
                      {category.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-xs text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Date</Label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  <CalendarIcon className="size-4" />
                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(d) => d && field.onChange(d)}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shop">Shop (optional)</Label>
        <Input id="shop" placeholder="e.g. Whole Foods" {...register("shop")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="memo">Memo (optional)</Label>
        <Textarea id="memo" rows={2} placeholder="Add a note..." {...register("memo")} />
      </div>

      <Button type="submit" disabled={isPending} className="mt-1 h-12 w-full text-base">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {transaction ? "Save changes" : "Add transaction"}
      </Button>
    </form>
  );
}
