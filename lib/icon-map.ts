import {
  Clapperboard,
  Utensils,
  Home,
  ShoppingBag,
  MoreHorizontal,
  Wallet,
  Gift,
  Banknote,
  Bus,
  GraduationCap,
  HeartPulse,
  Plane,
  Dumbbell,
  PawPrint,
  Smartphone,
  Coffee,
  Fuel,
  Briefcase,
  PiggyBank,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP = {
  clapperboard: Clapperboard,
  utensils: Utensils,
  home: Home,
  "shopping-bag": ShoppingBag,
  "more-horizontal": MoreHorizontal,
  wallet: Wallet,
  gift: Gift,
  banknote: Banknote,
  bus: Bus,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  plane: Plane,
  dumbbell: Dumbbell,
  "paw-print": PawPrint,
  smartphone: Smartphone,
  coffee: Coffee,
  fuel: Fuel,
  briefcase: Briefcase,
  "piggy-bank": PiggyBank,
  "trending-up": TrendingUp,
} as const satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICON_MAP;

export const ICON_KEYS = Object.keys(ICON_MAP) as [IconKey, ...IconKey[]];

export function getIcon(key: string): LucideIcon {
  return (ICON_MAP as Record<string, LucideIcon>)[key] ?? MoreHorizontal;
}
