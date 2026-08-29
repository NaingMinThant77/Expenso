"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Wallet, Plus } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  username: string;
  email: string;
  image?: string | null;
  onAddTransaction: () => void;
};

export function Sidebar({ username, email, image, onAddTransaction }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card px-3 py-4 md:flex">
      <div className="my-4 ml-1 flex items-center gap-2 px-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="size-4" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Expenso</span>
      </div>

      <div className="flex w-full items-center gap-2 rounded-lg p-1.5 mb-4 text-left outline-none hover:bg-muted">
        <Avatar className="size-8">
          <AvatarImage src={image ?? undefined} alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{username}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <Button className="mb-4 w-full" onClick={onAddTransaction}>
        <Plus className="size-4" />
        Add transaction
      </Button>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon
                className={`relative z-10 size-4 ${isActive ? "text-primary" : ""}`}
              />
              <span
                className={`relative z-10 ${isActive ? "text-foreground" : ""}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
