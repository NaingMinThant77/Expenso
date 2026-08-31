export type CurrencyCode =
  | "MMK"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "THB"
  | "SGD"
  | "INR"
  | "CNY"
  | "KRW"
  | "AUD"
  | "MYR";

export type CurrencyOption = {
  code: CurrencyCode;
  name: string;
  symbol: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: "MMK", name: "Myanmar Kyat", symbol: "Ks " },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
];

export const DEFAULT_CURRENCY: CurrencyCode = "MMK";

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value);
}

export function getCurrency(code: string): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
