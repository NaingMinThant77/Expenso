"use client";

import { useMemo, useState, useTransition } from "react";
import { ShoppingCart, Trash2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateShoppingListDialog } from "./create-shopping-list-dialog";
import { ShoppingListDetailDialog } from "./shopping-list-detail-dialog";
import { useCurrency } from "@/context/currency-context";
import { deleteShoppingList } from "@/lib/actions/shopping";
import type { SerializedShoppingList } from "@/lib/data/shopping";
import { format as dateFnsFormat } from "date-fns";

type Props = {
  lists: SerializedShoppingList[];
};

export function ShoppingListsView({ lists }: Props) {
  const [localLists, setLocalLists] = useState<SerializedShoppingList[]>([]);
  const [openListId, setOpenListId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<SerializedShoppingList | null>(null);
  const [isPending, startTransition] = useTransition();
  const { format } = useCurrency();

  const allLists = useMemo(() => {
    const knownIds = new Set(lists.map((l) => l.id));
    return [...localLists.filter((l) => !knownIds.has(l.id)), ...lists];
  }, [lists, localLists]);

  const openList = allLists.find((l) => l.id === openListId) ?? null;

  function handleCreated(list: SerializedShoppingList) {
    setLocalLists((prev) => [list, ...prev]);
    setOpenListId(list.id);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteShoppingList(deleteTarget.id);
      if (result?.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Couldn't delete list",
        );
        return;
      }
      setLocalLists((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      toast.success("Shopping list deleted");
      setDeleteTarget(null);
    });
  }

  if (allLists.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No shopping lists yet"
        description="Create a list, add items with prices, and check them off as you shop."
        action={<CreateShoppingListDialog onCreated={handleCreated} />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateShoppingListDialog onCreated={handleCreated} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {allLists.map((list) => {
          const checkedTotal = list.items
            .filter((item) => item.checked)
            .reduce((sum, item) => sum + item.amount, 0);
          const checkedCount = list.items.filter((item) => item.checked).length;

          return (
            <div
              key={list.id}
              className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="shrink-0 text-muted-foreground text-sm">
                    {dateFnsFormat(list.createdAt, "MMM d, yyyy")}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ListChecks className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" title={list.name}>
                        <span className="block min-w-0 truncate">
                          {list.name}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {list.items.length} item
                        {list.items.length === 1 ? "" : "s"} · {checkedCount}{" "}
                        checked
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteTarget(list)}
                  aria-label="Delete list"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Checked total</span>
                <span className="font-semibold">{format(checkedTotal)}</span>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOpenListId(list.id)}
              >
                Open list
              </Button>
            </div>
          );
        })}
      </div>

      {openList && (
        <ShoppingListDetailDialog
          list={openList}
          open={openListId !== null}
          onOpenChange={(next) => !next && setOpenListId(null)}
        />
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this shopping list?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot; and
              all of its items. This action can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
