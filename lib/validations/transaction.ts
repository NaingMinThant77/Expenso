import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: z.enum(["CASH", "BANK"]),
  categoryId: z.string().min(1, "Select a category"),
  date: z.coerce.date(),
  shop: z
    .string()
    .trim()
    .max(120, "Keep it under 120 characters")
    .optional()
    .or(z.literal("")),
  memo: z
    .string()
    .trim()
    .max(500, "Keep it under 500 characters")
    .optional()
    .or(z.literal("")),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
