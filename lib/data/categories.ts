import { prisma } from "@/lib/prisma";
import type { CategoryType, Prisma } from "@prisma/client";

export function getCategoriesForUser(userId: string, type?: CategoryType) {
  return prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
      ...(type ? { type } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export type CategoryFilters = {
  q?: string;
  type?: CategoryType | "ALL";
};

export function getFilteredCategoriesForUser(userId: string, filters: CategoryFilters) {
  const where: Prisma.CategoryWhereInput = {
    OR: [{ userId: null }, { userId }],
  };

  if (filters.type && filters.type !== "ALL") {
    where.type = filters.type;
  }
  if (filters.q) {
    where.name = { contains: filters.q, mode: "insensitive" };
  }

  return prisma.category.findMany({
    where,
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}
