"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

export async function createCategory(input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  let created;
  try {
    created = await prisma.category.create({
      data: { ...parsed.data, userId: session.user.id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: { name: ["A category with this name already exists"] } };
    }
    throw error;
  }

  revalidatePath("/settings");
  revalidatePath("/settings/categories");
  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/calendar");
  return { success: true, data: created };
}

export async function updateCategory(id: string, input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing || (existing.userId !== null && existing.userId !== session.user.id)) {
    return { error: "Category not found" };
  }

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: { name: ["A category with this name already exists"] } };
    }
    throw error;
  }

  revalidatePath("/settings");
  revalidatePath("/settings/categories");
  revalidatePath("/transactions");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || (category.userId !== null && category.userId !== session.user.id)) {
    return { error: "Category not found" };
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        error: "This category has transactions and can't be deleted.",
      };
    }
    throw error;
  }

  revalidatePath("/settings");
  revalidatePath("/settings/categories");
  revalidatePath("/transactions");
  return { success: true };
}
