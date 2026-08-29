"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Shapes, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getIcon } from "@/lib/icon-map";
import { deleteCategory } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/settings/category-form";
import type { Category } from "@prisma/client";

type Props = {
  categories: Category[];
};

export function CategoryManagementList({ categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);

  function handleDelete(id: string) {
    if (!window.confirm("Delete this category?")) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result?.error) {
        toast.error(
          typeof result.error === "string" ? result.error : "Couldn't delete",
        );
        return;
      }
      toast.success("Category deleted");
    });
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Shapes}
        title="No categories found"
        description="Create a category to start organizing your income and expenses."
        action={
          <CategoryForm
            trigger={
              <Button size="sm" className="mt-1">
                <Plus className="size-4" />
                New Category
              </Button>
            }
          />
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
      {categories.map((category) => {
        const Icon = getIcon(category.icon);
        return (
          <div
            key={category.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${category.color}1a`,
                color: category.color,
              }}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{category.name}</p>
            </div>
            <Badge
              variant={category.type === "INCOME" ? "default" : "secondary"}
            >
              {category.type === "INCOME" ? "Income" : "Expense"}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(category)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => handleDelete(category.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        );
      })}

      <CategoryForm
        category={editing ?? undefined}
        trigger={null}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </div>
  );
}
