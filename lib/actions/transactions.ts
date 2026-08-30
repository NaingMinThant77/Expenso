"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations/transaction";

export async function createTransaction(input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { shop, memo, ...rest } = parsed.data;

  const row = await prisma.transaction.create({
    data: {
      ...rest,
      userId: session.user.id,
      shop: shop || null,
      memo: memo || null,
    },
    include: { category: true },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true, data: { ...row, amount: Number(row.amount) } };
}

export async function updateTransaction(id: string, input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { shop, memo, ...rest } = parsed.data;

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return { error: "Transaction not found", code: "NOT_FOUND" as const };
  }

  const row = await prisma.transaction.update({
    where: { id },
    data: {
      ...rest,
      shop: shop || null,
      memo: memo || null,
    },
    include: { category: true },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true, data: { ...row, amount: Number(row.amount) } };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return { error: "Transaction not found", code: "NOT_FOUND" as const };
  }

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}
