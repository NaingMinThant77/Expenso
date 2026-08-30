"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@prisma/client";
import {
  createTransaction as createTransactionAction,
  updateTransaction as updateTransactionAction,
  deleteTransaction as deleteTransactionAction,
} from "@/lib/actions/transactions";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import { LOCAL_ID_PREFIX, isLocalId, type LocalTransaction, type OutboxEntry } from "@/lib/offline/types";
import {
  ensureUserScope,
  getAllLocalTransactions,
  getOutboxEntries,
  getPendingOutboxEntryForTarget,
  mergeServerCategories,
  mergeServerTransactions,
  putLocalTransaction,
  deleteLocalTransaction,
  putOutboxEntry,
  removeOutboxEntry,
  remapTransactionId,
} from "@/lib/offline/repository";
import { emitChanged, subscribeToChanges } from "@/lib/offline/broadcast";
import type { SerializedTransaction } from "@/lib/data/transactions";

type ActionResult = { error?: string | Record<string, string[] | undefined>; success?: true };

type OfflineContextValue = {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  transactions: LocalTransaction[];
  hydrateTransactions: (rows: SerializedTransaction[]) => Promise<void>;
  createTransaction: (values: TransactionInput) => Promise<ActionResult>;
  updateTransaction: (id: string, values: TransactionInput) => Promise<ActionResult>;
  deleteTransaction: (id: string) => Promise<ActionResult>;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

function isFieldErrors(error: unknown): error is Record<string, string[] | undefined> {
  return typeof error === "object" && error !== null;
}

function buildLocalRow(
  id: string,
  values: TransactionInput,
  category: Category,
  syncStatus: LocalTransaction["syncStatus"],
  existing?: LocalTransaction
): LocalTransaction {
  const now = existing?.createdAt ?? new Date();
  return {
    id,
    userId: existing?.userId ?? "",
    type: values.type,
    amount: values.amount,
    method: values.method,
    categoryId: values.categoryId,
    date: values.date,
    shop: values.shop || null,
    memo: values.memo || null,
    createdAt: now,
    updatedAt: new Date(),
    category,
    syncStatus,
  };
}

export function OfflineProvider({
  userId,
  categories,
  children,
}: {
  userId: string;
  categories: Category[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshFromLocal = useCallback(async () => {
    const [rows, outbox] = await Promise.all([getAllLocalTransactions(), getOutboxEntries()]);
    setTransactions(rows);
    setPendingCount(outbox.length);
  }, []);

  const runFlush = useCallback(async () => {
    setIsSyncing(true);
    try {
      const entries = await getOutboxEntries();
      for (const entry of entries) {
        try {
          if (entry.type === "create") {
            const result = await createTransactionAction(entry.payload);
            if (!result.success) {
              if (isFieldErrors(result.error)) {
                await removeOutboxEntry(entry.localOpId);
                continue;
              }
              break;
            }
            await remapTransactionId(entry.targetId, result.data.id);
            await removeOutboxEntry(entry.localOpId);
          } else if (entry.type === "update") {
            const result = await updateTransactionAction(entry.targetId, entry.payload);
            if (!result.success) {
              if (isFieldErrors(result.error) || "code" in result) {
                await removeOutboxEntry(entry.localOpId);
                continue;
              }
              break;
            }
            await removeOutboxEntry(entry.localOpId);
          } else {
            const result = await deleteTransactionAction(entry.targetId);
            if (!result.success) {
              if ("code" in result) {
                await removeOutboxEntry(entry.localOpId);
                continue;
              }
              break;
            }
            await removeOutboxEntry(entry.localOpId);
          }
        } catch {
          break; // network dropped mid-flush — stop, resume on next online event
        }
      }
    } finally {
      const remaining = await getOutboxEntries();
      await refreshFromLocal();
      emitChanged();
      setIsSyncing(false);
      if (remaining.length === 0) {
        router.refresh();
      }
    }
  }, [refreshFromLocal, router]);

  const flushOutbox = useCallback(async () => {
    if (typeof navigator === "undefined" || !("locks" in navigator)) {
      await runFlush();
      return;
    }
    await navigator.locks.request("expenso-outbox-flush", { ifAvailable: true }, async (lock) => {
      if (!lock) return;
      await runFlush();
    });
  }, [runFlush]);

  // init: scope the cache to the current user, load whatever's already cached
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureUserScope(userId);
      if (cancelled) return;
      await refreshFromLocal();
      if (navigator.onLine) void flushOutbox();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // best-effort category cache for surviving an offline hard reload
  useEffect(() => {
    void mergeServerCategories(categories);
  }, [categories]);

  // cross-tab consistency
  useEffect(() => subscribeToChanges(() => void refreshFromLocal()), [refreshFromLocal]);

  // connectivity tracking
  useEffect(() => {
    setIsOnline(navigator.onLine);
    function onOnline() {
      setIsOnline(true);
      void flushOutbox();
    }
    function onOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [flushOutbox]);

  const hydrateTransactions = useCallback(
    async (rows: SerializedTransaction[]) => {
      await mergeServerTransactions(rows.map((row) => ({ ...row, syncStatus: "synced" as const })));
      await refreshFromLocal();
    },
    [refreshFromLocal]
  );

  const createTransaction = useCallback(
    async (values: TransactionInput): Promise<ActionResult> => {
      const parsed = transactionSchema.safeParse(values);
      if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

      if (isOnline) {
        try {
          const result = await createTransactionAction(parsed.data);
          if (!result.success) return { error: result.error };
          await putLocalTransaction({ ...result.data, syncStatus: "synced" });
          await refreshFromLocal();
          emitChanged();
          return { success: true };
        } catch {
          // network failure mid-attempt — fall through to offline queueing
        }
      }

      const category = categories.find((c) => c.id === parsed.data.categoryId);
      if (!category) return { error: "Select a category" };

      const localId = `${LOCAL_ID_PREFIX}${crypto.randomUUID()}`;
      const row = buildLocalRow(localId, parsed.data, category, "pending");
      row.userId = userId;

      await putLocalTransaction(row);
      await putOutboxEntry({
        localOpId: crypto.randomUUID(),
        type: "create",
        targetId: localId,
        payload: parsed.data,
        createdAt: Date.now(),
        attempts: 0,
      });
      await refreshFromLocal();
      emitChanged();
      return { success: true };
    },
    [isOnline, categories, userId, refreshFromLocal]
  );

  const updateTransaction = useCallback(
    async (id: string, values: TransactionInput): Promise<ActionResult> => {
      const parsed = transactionSchema.safeParse(values);
      if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

      if (isLocalId(id)) {
        const pending = await getPendingOutboxEntryForTarget(id);
        const category = categories.find((c) => c.id === parsed.data.categoryId);
        if (!category) return { error: "Select a category" };

        const existing = (await getAllLocalTransactions()).find((t) => t.id === id);
        const row = buildLocalRow(id, parsed.data, category, "pending", existing);
        await putLocalTransaction(row);
        if (pending && pending.type === "create") {
          await putOutboxEntry({ ...pending, payload: parsed.data });
        }
        await refreshFromLocal();
        emitChanged();
        return { success: true };
      }

      if (isOnline) {
        try {
          const result = await updateTransactionAction(id, parsed.data);
          if (!result.success) return { error: result.error };
          await putLocalTransaction({ ...result.data, syncStatus: "synced" });
          await refreshFromLocal();
          emitChanged();
          return { success: true };
        } catch {
          // fall through to offline queueing
        }
      }

      const category = categories.find((c) => c.id === parsed.data.categoryId);
      if (!category) return { error: "Select a category" };

      const existing = (await getAllLocalTransactions()).find((t) => t.id === id);
      const row = buildLocalRow(id, parsed.data, category, "pending", existing);
      await putLocalTransaction(row);

      const pending = await getPendingOutboxEntryForTarget(id);
      if (pending && pending.type === "update") {
        await putOutboxEntry({ ...pending, payload: parsed.data });
      } else {
        await putOutboxEntry({
          localOpId: crypto.randomUUID(),
          type: "update",
          targetId: id,
          payload: parsed.data,
          createdAt: Date.now(),
          attempts: 0,
        });
      }
      await refreshFromLocal();
      emitChanged();
      return { success: true };
    },
    [isOnline, categories, refreshFromLocal]
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<ActionResult> => {
      if (isLocalId(id)) {
        const pending = await getPendingOutboxEntryForTarget(id);
        if (pending) await removeOutboxEntry(pending.localOpId);
        await deleteLocalTransaction(id);
        await refreshFromLocal();
        emitChanged();
        return { success: true };
      }

      if (isOnline) {
        try {
          const result = await deleteTransactionAction(id);
          if (!result.success && !("code" in result)) return { error: result.error };
          await deleteLocalTransaction(id);
          await refreshFromLocal();
          emitChanged();
          return { success: true };
        } catch {
          // fall through to offline queueing
        }
      }

      const pending = await getPendingOutboxEntryForTarget(id);
      if (pending && pending.type === "update") {
        await removeOutboxEntry(pending.localOpId);
      }
      await deleteLocalTransaction(id);
      await putOutboxEntry({
        localOpId: crypto.randomUUID(),
        type: "delete",
        targetId: id,
        createdAt: Date.now(),
        attempts: 0,
      });
      await refreshFromLocal();
      emitChanged();
      return { success: true };
    },
    [isOnline, refreshFromLocal]
  );

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        transactions,
        hydrateTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline must be used within an OfflineProvider");
  return ctx;
}

export type { OutboxEntry };
