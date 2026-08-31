"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";

type Props = {
  onAddTransaction: () => void;
};

export function BottomTabBar({ onAddTransaction }: Props) {
  const pathname = usePathname();
  const mid = Math.ceil(NAV_ITEMS.length / 2);
  const left = NAV_ITEMS.slice(0, mid);
  const right = NAV_ITEMS.slice(mid);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden"
      aria-label="Primary"
    >
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/95 px-2 py-2 shadow-jelly backdrop-blur">
        {left.map((item) => (
          <TabLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}

        <motion.button
          type="button"
          onClick={onAddTransaction}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92, y: 2 }}
          className="mx-1 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_3px_0_0_var(--primary-shadow)]"
          aria-label="Add transaction"
        >
          <Plus className="size-5" />
        </motion.button>

        {right.map((item) => (
          <TabLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  item,
  isActive,
}: {
  item: (typeof NAV_ITEMS)[number];
  isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="relative flex size-11 flex-col items-center justify-center gap-0.5 rounded-full text-muted-foreground"
    >
      {isActive && (
        <motion.div
          layoutId="bottomtab-active"
          className="absolute inset-0 rounded-full bg-primary/10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}
      <Icon className={`relative z-10 size-5 ${isActive ? "text-primary" : ""}`} />
    </Link>
  );
}
