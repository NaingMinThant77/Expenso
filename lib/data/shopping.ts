import { prisma } from "@/lib/prisma";

export type SerializedShoppingListItem = {
  id: string;
  name: string;
  amount: number;
  checked: boolean;
  position: number;
};

export type SerializedShoppingList = {
  id: string;
  name: string;
  createdAt: Date;
  items: SerializedShoppingListItem[];
};

export async function getShoppingListsForUser(
  userId: string,
): Promise<SerializedShoppingList[]> {
  const lists = await prisma.shoppingList.findMany({
    where: { userId },
    include: { items: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return lists.map((list) => ({
    id: list.id,
    name: list.name,
    createdAt: list.createdAt,
    items: list.items.map((item) => ({
      id: item.id,
      name: item.name,
      amount: Number(item.amount),
      checked: item.checked,
      position: item.position,
    })),
  }));
}
