import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { auth } from "@/auth";
import { getShoppingListsForUser } from "@/lib/data/shopping";
import { ShoppingListsView } from "@/components/shopping/shopping-lists-view";

export default async function ShoppingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const lists = await getShoppingListsForUser(session.user.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <ShoppingCart className="size-4" />
        Shopping lists
      </div>

      <ShoppingListsView lists={lists} />
    </div>
  );
}
