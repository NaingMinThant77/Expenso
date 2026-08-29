"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { DayDetailDialog } from "./day-detail-dialog";
import type { CalendarDay } from "@/lib/data/calendar";
import type { Category } from "@prisma/client";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_DOTS = 3;

type Props = {
  year: number;
  month: number;
  days: CalendarDay[];
  categories: Category[];
};

export function CalendarGrid({ year, month, days, categories }: Props) {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const leadingBlanks = Array.from({ length: firstWeekday }, (_, i) => i);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month - 1;

  return (
    <>
      {/* 1. Increased container max width: max-w-2xl -> max-w-4xl (or max-w-5xl/full) and padding: p-4 -> p-6 */}
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-2.5 sm:p-4">
        {/* 2. Increased header gap and font size */}
        <div className="mb-2 grid grid-cols-7 gap-1 sm:mb-3 sm:gap-2">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="py-1.5 text-center text-xs font-semibold tracking-wide text-muted-foreground sm:text-sm"
            >
              {w}
            </div>
          ))}
        </div>

        {/* 3. Increased grid gap: gap-1.5 -> gap-2 */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {leadingBlanks.map((i) => (
            /* 4. Set minimum height for larger tiles or keep aspect-square */
            <div key={`blank-${i}`} className="aspect-square rounded-xl" />
          ))}

          {days.map((day) => {
            const isToday = isCurrentMonth && today.getDate() === day.day;
            const total = day.incomeCount + day.expenseCount;
            const greenDots = Math.min(day.incomeCount, MAX_DOTS);
            const redDots = Math.min(day.expenseCount, MAX_DOTS - greenDots);
            const overflow = total - greenDots - redDots;

            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  /* 5. Increased padding (p-1.5 -> p-2.5) & added min-h-[90px] for reliable height */
                  "group relative aspect-square min-w-0 rounded-xl border border-transparent p-1 text-left transition-colors hover:border-border hover:bg-muted/50 sm:p-2.5",
                  isToday && "border-primary bg-primary/5",
                )}
              >
                {/* 6. Increased day circle size: size-6 -> size-7/size-8 */}
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-xs font-semibold sm:size-7 sm:text-sm",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {day.day}
                </span>

                {total > 0 && (
                  /* 7. Increased dot container spacing and dot sizes: size-1.5 -> size-2 */
                  <div className="mt-1 flex flex-wrap items-center gap-0.5 px-0.5 sm:mt-2 sm:gap-1">
                    {Array.from({ length: greenDots }).map((_, i) => (
                      <span
                        key={`g-${i}`}
                        className="size-1.5 rounded-full bg-emerald-500 sm:size-2"
                      />
                    ))}
                    {Array.from({ length: redDots }).map((_, i) => (
                      <span
                        key={`r-${i}`}
                        className="size-1.5 rounded-full bg-rose-500 sm:size-2"
                      />
                    ))}
                    {overflow > 0 && (
                      <span className="text-xs leading-none text-muted-foreground">
                        …
                      </span>
                    )}
                  </div>
                )}

                {total > 0 && (
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-xl border border-border bg-popover px-2.5 py-1.5 text-xs shadow-jelly-sm group-hover:block">
                    {day.incomeCount > 0 && (
                      <p className="text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(day.income)}
                      </p>
                    )}
                    {day.expenseCount > 0 && (
                      <p className="text-rose-600 dark:text-rose-400">
                        -{formatCurrency(day.expense)}
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <DayDetailDialog
          date={selectedDay.date}
          transactions={selectedDay.transactions}
          categories={categories}
          open={selectedDay !== null}
          onOpenChange={(open) => !open && setSelectedDay(null)}
        />
      )}
    </>
  );
}
