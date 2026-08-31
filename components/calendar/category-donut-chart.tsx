"use client";

import { getIcon } from "@/lib/icon-map";
import { useCurrency } from "@/context/currency-context";
import type { CategorySlice } from "@/lib/data/reports";

const MAX_SLICES = 6;
const OTHER_COLOR = "#6b7280";

export function CategoryDonutChart({ slices }: { slices: CategorySlice[] }) {
  const { format } = useCurrency();

  if (slices.length === 0) {
    return (
      <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No expense data available for chart.
      </div>
    );
  }

  const visible = slices.slice(0, MAX_SLICES);
  const rest = slices.slice(MAX_SLICES);
  const otherTotal = rest.reduce((sum, s) => sum + s.total, 0);
  const otherPercent = rest.reduce((sum, s) => sum + s.percent, 0);

  const legendSlices: CategorySlice[] =
    rest.length > 0
      ? [
          ...visible,
          {
            categoryId: "other",
            name: "Other",
            color: OTHER_COLOR,
            icon: "more-horizontal",
            total: otherTotal,
            percent: otherPercent,
          },
        ]
      : visible;

  let cursor = 0;
  const stops = legendSlices.map((slice) => {
    const start = cursor;
    const end = cursor + (slice.percent / 100) * 360;
    cursor = end;
    return `${slice.color} ${start}deg ${end}deg`;
  });

  const total = slices.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto size-40 shrink-0">
        <div
          className="size-full rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        />
        <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-semibold">{format(total)}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        {legendSlices.map((slice) => {
          const Icon = getIcon(slice.icon);
          return (
            <div key={slice.categoryId} className="flex items-center gap-2 text-sm">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${slice.color}1a`, color: slice.color }}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate">{slice.name}</span>
              <span className="shrink-0 text-muted-foreground">{slice.percent.toFixed(0)}%</span>
              <span className="shrink-0 whitespace-nowrap text-right font-medium">
                {format(slice.total)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
