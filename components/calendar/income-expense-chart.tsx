"use client";

import { useCurrency } from "@/context/currency-context";
import type { MonthlyTrendPoint } from "@/lib/data/reports";

const HEIGHT = 200;
const BAR_WIDTH = 18;
const BAR_GAP = 3;
const GROUP_WIDTH = 64;
const PADDING_LEFT = 44;
const PADDING_BOTTOM = 24;
const PADDING_TOP = 12;

function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function IncomeExpenseChart({ points }: { points: MonthlyTrendPoint[] }) {
  const { format } = useCurrency();
  const rawMax = Math.max(...points.map((p) => Math.max(p.income, p.expense)), 0);
  const max = niceMax(rawMax || 100);
  const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max];

  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const width = PADDING_LEFT + points.length * GROUP_WIDTH + 12;

  function barHeight(value: number) {
    return max > 0 ? (value / max) * plotHeight : 0;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Income</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-500" />
          <span className="text-muted-foreground">Expense</span>
        </span>
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label="Income versus expenses by month"
          className="min-w-[300px] sm:min-w-[420px]"
        >
          {ticks.map((tick, i) => {
            const y = PADDING_TOP + plotHeight - (tick / max) * plotHeight;
            return (
              <g key={i}>
                <line
                  x1={PADDING_LEFT}
                  x2={width - 8}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={1}
                  className="text-border"
                />
                <text
                  x={PADDING_LEFT - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : Math.round(tick)}
                </text>
              </g>
            );
          })}

          {points.map((point, i) => {
            const groupX = PADDING_LEFT + i * GROUP_WIDTH + 12;
            const incomeH = barHeight(point.income);
            const expenseH = barHeight(point.expense);
            const baseline = PADDING_TOP + plotHeight;

            return (
              <g key={point.label}>
                <rect
                  x={groupX}
                  y={baseline - incomeH}
                  width={BAR_WIDTH}
                  height={Math.max(incomeH, 1)}
                  rx={4}
                  className="fill-emerald-500"
                >
                  <title>{`${point.label}: Income ${format(point.income)}`}</title>
                </rect>
                <rect
                  x={groupX + BAR_WIDTH + BAR_GAP}
                  y={baseline - expenseH}
                  width={BAR_WIDTH}
                  height={Math.max(expenseH, 1)}
                  rx={4}
                  className="fill-rose-500"
                >
                  <title>{`${point.label}: Expense ${format(point.expense)}`}</title>
                </rect>
                <text
                  x={groupX + BAR_WIDTH + BAR_GAP / 2}
                  y={baseline + 16}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {point.label}
                </text>
              </g>
            );
          })}

          <line
            x1={PADDING_LEFT}
            x2={width - 8}
            y1={PADDING_TOP + plotHeight}
            y2={PADDING_TOP + plotHeight}
            stroke="currentColor"
            strokeWidth={1}
            className="text-muted-foreground/40"
          />
        </svg>
      </div>
    </div>
  );
}
