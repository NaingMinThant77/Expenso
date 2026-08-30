"use client";

import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useOffline } from "@/context/offline-context";

export function OfflineStatusCard() {
  const { isOnline, isSyncing, pendingCount } = useOffline();

  const status = !isOnline
    ? {
        label: "Offline",
        description:
          pendingCount > 0
            ? `${pendingCount} change${pendingCount === 1 ? "" : "s"} queued — will sync when you're back online.`
            : "Instant local mutations with background cloud sync.",
        tone: "amber",
        icon: WifiOff,
      }
    : isSyncing
      ? {
          label: "Syncing",
          description: "Sending queued changes to the server…",
          tone: "primary",
          icon: RefreshCw,
        }
      : {
          label: "Operational",
          description: "Instant local mutations with background cloud sync.",
          tone: "emerald",
          icon: Wifi,
        };

  const Icon = status.icon;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          status.tone === "emerald" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          status.tone === "amber" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          status.tone === "primary" && "bg-primary/10 text-primary"
        )}
      >
        <Icon className={cn("size-4", isSyncing && "animate-spin")} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">Offline Sync &amp; Service Worker</p>
        <p className="text-xs text-muted-foreground">{status.description}</p>
      </div>
      <Badge
        className={cn(
          "gap-1.5",
          status.tone === "emerald" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          status.tone === "amber" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          status.tone === "primary" && "bg-primary/10 text-primary"
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            status.tone === "emerald" && "bg-emerald-500",
            status.tone === "amber" && "bg-amber-500",
            status.tone === "primary" && "bg-primary animate-pulse"
          )}
        />
        {status.label}
      </Badge>
    </div>
  );
}
