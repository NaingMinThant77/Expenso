"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { shoppingListNameSchema, shoppingListItemsSchema } from "@/lib/validations/shopping";

export async function createShoppingList(input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = shoppingListNameSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const list = await prisma.shoppingList.create({
    data: { name: parsed.data.name, userId: session.user.id },
    include: { items: true },
  });

  revalidatePath("/shopping");
  return { success: true, data: list };
}

export async function renameShoppingList(id: string, input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = shoppingListNameSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const existing = await prisma.shoppingList.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return { error: "Shopping list not found" };
  }

  await prisma.shoppingList.update({ where: { id }, data: { name: parsed.data.name } });

  revalidatePath("/shopping");
  return { success: true };
}

export async function deleteShoppingList(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const existing = await prisma.shoppingList.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return { error: "Shopping list not found" };
  }

  await prisma.shoppingList.delete({ where: { id } });

  revalidatePath("/shopping");
  return { success: true };
}

export async function saveShoppingListItems(listId: string, input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = shoppingListItemsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const list = await prisma.shoppingList.findUnique({ where: { id: listId } });
  if (!list || list.userId !== session.user.id) {
    return { error: "Shopping list not found" };
  }

  const keepIds = parsed.data.items.map((item) => item.id).filter((id): id is string => !!id);

  await prisma.$transaction([
    prisma.shoppingListItem.deleteMany({
      where: { listId, id: { notIn: keepIds.length > 0 ? keepIds : ["__none__"] } },
    }),
    ...parsed.data.items.map((item, index) =>
      item.id
        ? prisma.shoppingListItem.update({
            where: { id: item.id },
            data: { name: item.name, amount: item.amount, checked: item.checked, position: index },
          })
        : prisma.shoppingListItem.create({
            data: {
              listId,
              name: item.name,
              amount: item.amount,
              checked: item.checked,
              position: index,
            },
          })
    ),
  ]);

  revalidatePath("/shopping");
  return { success: true };
}
