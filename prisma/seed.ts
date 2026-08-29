import { PrismaClient, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

const defaults: {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}[] = [
  { name: "Entertainment", type: CategoryType.EXPENSE, icon: "clapperboard", color: "#a855f7" },
  { name: "Food", type: CategoryType.EXPENSE, icon: "utensils", color: "#f97316" },
  { name: "Housing & Utilities", type: CategoryType.EXPENSE, icon: "home", color: "#3b82f6" },
  { name: "Shopping", type: CategoryType.EXPENSE, icon: "shopping-bag", color: "#ec4899" },
  { name: "Other Expense", type: CategoryType.EXPENSE, icon: "more-horizontal", color: "#6b7280" },
  { name: "Salary", type: CategoryType.INCOME, icon: "wallet", color: "#22c55e" },
  { name: "Gift", type: CategoryType.INCOME, icon: "gift", color: "#14b8a6" },
  { name: "Other Income", type: CategoryType.INCOME, icon: "more-horizontal", color: "#6b7280" },
];

async function main() {
  for (const category of defaults) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: category.name, type: category.type },
    });
    if (!existing) {
      await prisma.category.create({ data: category });
    }
  }
  console.log(`Seeded ${defaults.length} default categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
