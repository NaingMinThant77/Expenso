"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICON_MAP, ICON_KEYS, type IconKey } from "@/lib/icon-map";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { Category } from "@prisma/client";

export const PRESET_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#f97316",
  "#f59e0b",
  "#14b8a6",
  "#ef4444",
  "#6366f1",
  "#6b7280",
];

type Props = {
  category?: Category;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function toIconKey(icon: string): IconKey {
  return (ICON_KEYS as readonly string[]).includes(icon) ? (icon as IconKey) : ICON_KEYS[0];
}

export function CategoryForm({ category, trigger, open, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [isPending, startTransition] = useTransition();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          type: category.type,
          icon: toIconKey(category.icon),
          color: category.color,
        }
      : { name: "", type: "EXPENSE", icon: ICON_KEYS[0], color: PRESET_COLORS[0] },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        category
          ? {
          name: category.name,
          type: category.type,
          icon: toIconKey(category.icon),
          color: category.color,
        }
          : { name: "", type: "EXPENSE", icon: ICON_KEYS[0], color: PRESET_COLORS[0] }
      );
    }
  }, [isOpen, category, reset]);

  function onSubmit(values: CategoryInput) {
    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, values)
        : await createCategory(values);

      if (result?.error) {
        const message =
          typeof result.error === "string"
            ? result.error
            : result.error.name?.[0] ?? "Something went wrong";
        toast.error(message);
        return;
      }
      toast.success(category ? "Category updated" : "Category created");
      setOpen(false);
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="size-4" />
            New category
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Update this category's name, icon, or color."
              : "Create a custom income or expense category."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="EXPENSE" className="flex-1">
                    Expense
                  </TabsTrigger>
                  <TabsTrigger value="INCOME" className="flex-1">
                    Income
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Icon</Label>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div className="grid grid-cols-6 gap-1.5">
                  {ICON_KEYS.map((key) => {
                    const Icon = ICON_MAP[key];
                    const selected = field.value === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => field.onChange(key)}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      style={{ backgroundColor: color }}
                      className="flex size-7 items-center justify-center rounded-full"
                    >
                      {field.value === color && <Check className="size-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {category ? "Save changes" : "Create category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
