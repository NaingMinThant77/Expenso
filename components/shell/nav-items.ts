import {
  LayoutDashboard,
  ListOrdered,
  CalendarDays,
  Settings,
  ShoppingCart,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
