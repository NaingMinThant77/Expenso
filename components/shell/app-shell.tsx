"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { BottomTabBar } from "./bottom-tab-bar";
import { PageTransition } from "./page-transition";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import type { Category } from "@prisma/client";

type Props = {
  username: string;
  email: string;
  image?: string | null;
  categories: Category[];
  children: ReactNode;
};

export function AppShell({ username, email, image, categories, children }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        username={username}
        email={email}
        image={image}
        onAddTransaction={() => setAddOpen(true)}
      />

      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          <div className="mx-auto w-full max-w-4xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>

      <BottomTabBar onAddTransaction={() => setAddOpen(true)} />

      <TransactionDialog categories={categories} open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
