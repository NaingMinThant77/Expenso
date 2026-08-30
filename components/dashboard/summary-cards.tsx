"use client";

import { motion } from "motion/react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Banknote,
  Landmark,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  totalIncome: number;
  totalExpense: number;
  cashBalance: number;
  bankBalance: number;
  netBalance: number;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function SummaryCards({
  totalIncome,
  totalExpense,
  cashBalance,
  bankBalance,
  netBalance,
}: Props) {
  const cards = [
    {
      label: "Income",
      value: totalIncome,
      icon: TrendingUp,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Expense",
      value: totalExpense,
      icon: TrendingDown,
      tone: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Cash",
      value: cashBalance,
      icon: Banknote,
      tone: "text-foreground",
    },
    {
      label: "Bank",
      value: bankBalance,
      icon: Landmark,
      tone: "text-foreground",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between gap-3 px-4">
            <div className="min-w-0">
              <p className="text-sm opacity-80">Total money left</p>
              <p className="mt-1 truncate text-3xl font-semibold tracking-tight">
                {formatCurrency(netBalance)}
              </p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
              <Wallet className="size-5" />
            </span>
          </div>
        </Card>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={item}>
              <Card>
                <div className="flex items-center gap-3 px-4">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted",
                      card.tone,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                    <p
                      className={cn(
                        "truncate text-base font-semibold",
                        card.tone,
                      )}
                    >
                      {formatCurrency(card.value)}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
