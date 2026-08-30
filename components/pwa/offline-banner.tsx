"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useOffline } from "@/context/offline-context";

export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing } = useOffline();

  if (isOnline && pendingCount === 0 && !isSyncing) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-2xl sm:right-4 sm:left-auto">
      {!isOnline ? (
        <>
          <WifiOff className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-foreground">
            You&apos;re offline
            {pendingCount > 0 && (
              <span className="text-muted-foreground">
                {" "}
                — {pendingCount} change{pendingCount === 1 ? "" : "s"} will sync
              </span>
            )}
          </span>
        </>
      ) : (
        <>
          <RefreshCw className="size-4 shrink-0 animate-spin text-primary" />
          <span className="text-foreground">Syncing…</span>
        </>
      )}
    </div>
  );
}
