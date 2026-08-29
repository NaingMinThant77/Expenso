import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCategoriesForUser } from "@/lib/data/categories";
import { AppShell } from "@/components/shell/app-shell";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const categories = await getCategoriesForUser(user.id);

  return (
    <AppShell
      username={user.username}
      email={user.email}
      image={user.image}
      categories={categories}
    >
      {children}
    </AppShell>
  );
}
