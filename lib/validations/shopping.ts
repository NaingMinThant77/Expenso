import { z } from "zod";

export const shoppingListNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Keep it under 60 characters"),
});

export type ShoppingListNameInput = z.infer<typeof shoppingListNameSchema>;

export const shoppingListItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(120, "Keep it under 120 characters"),
  amount: z.coerce.number().min(0, "Must be 0 or more"),
  checked: z.boolean(),
});

export const shoppingListItemsSchema = z.object({
  items: z.array(shoppingListItemSchema),
});

export type ShoppingListItemInput = z.infer<typeof shoppingListItemSchema>;
export type ShoppingListItemsInput = z.infer<typeof shoppingListItemsSchema>;
