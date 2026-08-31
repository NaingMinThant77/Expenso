"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { BottomTabBar } from "./bottom-tab-bar";
import { PageTransition } from "./page-transition";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { OfflineProvider } from "@/context/offline-context";
import { CurrencyProvider } from "@/context/currency-context";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import type { Category } from "@prisma/client";

type Props = {
  userId: string;
  username: string;
  email: string;
  image?: string | null;
  categories: Category[];
  currency: string;
  children: ReactNode;
};

export function AppShell({
  userId,
  username,
  email,
  image,
  categories,
  currency,
  children,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <CurrencyProvider initialCurrency={currency}>
      <OfflineProvider userId={userId} categories={categories}>
        <div className="flex min-h-screen">
          <Sidebar
            username={username}
            email={email}
            image={image}
            onAddTransaction={() => setAddOpen(true)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
              <div className="mx-auto w-full min-w-0 max-w-4xl">
                <PageTransition>{children}</PageTransition>
              </div>
            </main>
          </div>

          <BottomTabBar onAddTransaction={() => setAddOpen(true)} />

          <TransactionDialog categories={categories} open={addOpen} onOpenChange={setAddOpen} />
          <OfflineBanner />
        </div>
      </OfflineProvider>
    </CurrencyProvider>
  );
}
