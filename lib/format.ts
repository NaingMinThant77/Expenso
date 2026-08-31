import { DEFAULT_CURRENCY, getCurrency, type CurrencyCode } from "@/lib/currency";

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY) {
  const { symbol } = getCurrency(currencyCode);
  return `${symbol}${numberFormatter.format(amount)}`;
}
