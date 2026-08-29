"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Props = {
  year: number;
  month: number;
  monthIncome: number;
  monthExpense: number;
};

export function MonthNav({ year, month, monthIncome, monthExpense }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(deltaMonths: number) {
    const d = new Date(year, month - 1 + deltaMonths, 1);
    const params = new URLSearchParams(searchParams);
    params.set("year", String(d.getFullYear()));
    params.set("month", String(d.getMonth() + 1));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1.5 py-1.5">
        <Button variant="ghost" size="icon-sm" onClick={() => go(-1)} aria-label="Previous month">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-36 text-center text-sm font-semibold">
          {MONTH_LABELS[month - 1]} {year}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => go(1)} aria-label="Next month">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="size-3.5" />
          {formatCurrency(monthIncome)}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400">
          <ArrowDownRight className="size-3.5" />
          {formatCurrency(monthExpense)}
        </span>
      </div>
    </div>
  );
}
