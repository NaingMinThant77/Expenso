"use client";

import { useEffect, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCurrency } from "@/context/currency-context";
import { saveShoppingListItems } from "@/lib/actions/shopping";
import type { SerializedShoppingList } from "@/lib/data/shopping";

type ItemRow = {
  id?: string;
  name: string;
  amount: number;
  checked: boolean;
};

type FormValues = { items: ItemRow[] };

const EMPTY_ROW: ItemRow = { name: "", amount: 0, checked: false };

function toFormItems(list: SerializedShoppingList): ItemRow[] {
  return list.items.length > 0
    ? list.items.map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        checked: item.checked,
      }))
    : [{ ...EMPTY_ROW }];
}

type Props = {
  list: SerializedShoppingList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShoppingListDetailDialog({ list, open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();
  const { format, symbol } = useCurrency();

  const { control, register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { items: toFormItems(list) },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (open) reset({ items: toFormItems(list) });
  }, [open, list, reset]);

  const items = watch("items");
  const total = items.reduce(
    (sum, item) => sum + (item.checked ? Number(item.amount) || 0 : 0),
    0
  );

  function onSubmit(values: FormValues) {
    const cleaned = values.items
      .filter((item) => item.name.trim().length > 0)
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        amount: Number(item.amount) || 0,
        checked: item.checked,
      }));

    startTransition(async () => {
      const result = await saveShoppingListItems(list.id, { items: cleaned });
      if (result?.error) {
        toast.error(typeof result.error === "string" ? result.error : "Couldn't save the list");
        return;
      }
      toast.success("Shopping list saved");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-5 overflow-y-auto p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{list.name}</DialogTitle>
          <DialogDescription>Add items, check them off, and track the total.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Controller
                  control={control}
                  name={`items.${index}.checked`}
                  render={({ field: checkedField }) => (
                    <Checkbox
                      checked={checkedField.value}
                      onCheckedChange={(value) => checkedField.onChange(value === true)}
                    />
                  )}
                />
                <Input
                  placeholder="Item name"
                  className="min-w-0 flex-1"
                  {...register(`items.${index}.name`)}
                />
                <div className="relative w-24 shrink-0 sm:w-28">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {symbol}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7 pr-2"
                    {...register(`items.${index}.amount`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  aria-label="Remove item"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => append({ ...EMPTY_ROW })}
          >
            <Plus className="size-4" />
            New item
          </Button>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm">
            <span className="text-muted-foreground">Total (checked)</span>
            <span className="font-semibold">{format(total)}</span>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="h-11 w-full text-base">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
