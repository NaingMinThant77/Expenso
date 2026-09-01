"use client";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/context/currency-context";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";

export function CurrencySelect() {
  const { currency, setCurrency } = useCurrency();

  function handleChange(next: string) {
    setCurrency(next as CurrencyCode);
    toast.success("Currency updated");
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs text-muted-foreground">
          Used to display amounts across the app
        </p>
      </div>
      <Select value={currency} onValueChange={handleChange}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="font-medium">{c.symbol}</span>
              {c.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
