import { z } from "zod";
import { isCurrencyCode } from "@/lib/currency";

export const currencySchema = z.object({
  currency: z.string().refine(isCurrencyCode, "Unsupported currency"),
});

export type CurrencyInput = z.infer<typeof currencySchema>;

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be at most 24 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  image: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
