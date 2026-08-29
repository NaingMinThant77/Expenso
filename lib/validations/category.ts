import { z } from "zod";
import { ICON_KEYS } from "@/lib/icon-map";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40, "Keep it under 40 characters"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.enum(ICON_KEYS),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
