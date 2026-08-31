"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { shoppingListNameSchema, type ShoppingListNameInput } from "@/lib/validations/shopping";
import { createShoppingList } from "@/lib/actions/shopping";
import type { SerializedShoppingList } from "@/lib/data/shopping";

type Props = {
  trigger?: ReactNode;
  onCreated: (list: SerializedShoppingList) => void;
};

export function CreateShoppingListDialog({ trigger, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShoppingListNameInput>({
    resolver: zodResolver(shoppingListNameSchema),
    defaultValues: { name: "" },
  });

  function onSubmit(values: ShoppingListNameInput) {
    startTransition(async () => {
      const result = await createShoppingList(values);
      if (result?.error) {
        toast.error(typeof result.error === "string" ? result.error : "Couldn't create list");
        return;
      }
      toast.success("Shopping list created");
      reset();
      setOpen(false);
      if (result.data) {
        onCreated({
          id: result.data.id,
          name: result.data.name,
          createdAt: result.data.createdAt,
          items: [],
        });
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="size-4" />
            New list
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New shopping list</DialogTitle>
          <DialogDescription>Give your list a name to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="list-name">Name</Label>
            <Input id="list-name" placeholder="e.g. Weekly groceries" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Create list
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
