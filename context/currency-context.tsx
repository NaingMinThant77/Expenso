"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { formatCurrency } from "@/lib/format";
import { updateCurrency as updateCurrencyAction } from "@/lib/actions/settings";
import { DEFAULT_CURRENCY, getCurrency, isCurrencyCode, type CurrencyCode } from "@/lib/currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (currency: CurrencyCode) => void;
  format: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  initialCurrency,
  children,
}: {
  initialCurrency: string;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    isCurrencyCode(initialCurrency) ? initialCurrency : DEFAULT_CURRENCY
  );

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    void updateCurrencyAction(next);
  }, []);

  const format = useCallback((amount: number) => formatCurrency(amount, currency), [currency]);

  return (
    <CurrencyContext.Provider
      value={{ currency, symbol: getCurrency(currency).symbol, setCurrency, format }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
