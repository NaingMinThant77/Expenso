import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getFilteredCategoriesForUser } from "@/lib/data/categories";
import { CategoryForm } from "@/components/settings/category-form";
import { CategoryFilters } from "@/components/categories/category-filters";
import { CategoryManagementList } from "@/components/categories/category-management-list";

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function CategoriesPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const categories = await getFilteredCategoriesForUser(session.user.id, {
    q: params.q,
    type: params.type as "INCOME" | "EXPENSE" | "ALL" | undefined,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href="/settings"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Settings
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <CategoryForm />
        </div>
      </div>

      <CategoryFilters />
      <CategoryManagementList categories={categories} />
    </div>
  );
}
