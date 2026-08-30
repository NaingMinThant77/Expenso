import type { Category } from "@prisma/client";
import { getDb } from "./db";
import { isLocalId, type LocalTransaction, type OutboxEntry } from "./types";

// The local cache is additive-only: it's seeded incrementally from whatever
// pages/views the user has visited while online (the dashboard's 5 recent,
// each visited page of /transactions, etc), not a mirror of the user's
// entire history. We only ever remove a record in response to an explicit
// delete (optimistic, or a synced outbox "delete"), never because a given
// server snapshot simply doesn't happen to include it — otherwise viewing
// page 2 of /transactions would look like page 1's rows got deleted.

export async function getUserScope(): Promise<string | undefined> {
  const db = await getDb();
  const row = await db.get("meta", "userId");
  return row?.userId;
}

export async function ensureUserScope(userId: string): Promise<void> {
  const db = await getDb();
  const row = await db.get("meta", "userId");
  if (row && row.userId === userId) return;

  const tx = db.transaction(["transactions", "categories", "outbox", "meta"], "readwrite");
  await Promise.all([
    tx.objectStore("transactions").clear(),
    tx.objectStore("categories").clear(),
    tx.objectStore("outbox").clear(),
    tx.objectStore("meta").put({ key: "userId", userId }),
    tx.done,
  ]);
}

export async function getAllLocalTransactions(): Promise<LocalTransaction[]> {
  const db = await getDb();
  const rows = await db.getAll("transactions");
  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllLocalCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.getAll("categories");
}

export async function putLocalTransaction(row: LocalTransaction): Promise<void> {
  const db = await getDb();
  await db.put("transactions", row);
}

export async function deleteLocalTransaction(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("transactions", id);
}

/** Additive upsert — never deletes a record just because it's absent from `rows`. */
export async function mergeServerTransactions(rows: LocalTransaction[]): Promise<void> {
  const db = await getDb();
  const outbox = await db.getAll("outbox");
  const protectedIds = new Set(outbox.map((entry) => entry.targetId));

  const tx = db.transaction("transactions", "readwrite");
  await Promise.all([
    ...rows
      .filter((row) => !protectedIds.has(row.id))
      .map((row) => tx.store.put({ ...row, syncStatus: "synced" })),
    tx.done,
  ]);
}

export async function mergeServerCategories(categories: Category[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("categories", "readwrite");
  await Promise.all([...categories.map((c) => tx.store.put(c)), tx.done]);
}

export async function getOutboxEntries(): Promise<OutboxEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex("outbox", "by-createdAt");
}

export async function getPendingOutboxEntryForTarget(
  targetId: string
): Promise<OutboxEntry | undefined> {
  const entries = await getOutboxEntries();
  return entries.find((entry) => entry.targetId === targetId);
}

export async function putOutboxEntry(entry: OutboxEntry): Promise<void> {
  const db = await getDb();
  await db.put("outbox", entry);
}

export async function removeOutboxEntry(localOpId: string): Promise<void> {
  const db = await getDb();
  await db.delete("outbox", localOpId);
}

export async function remapTransactionId(oldId: string, newId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("transactions", "readwrite");
  const existing = await tx.store.get(oldId);
  if (existing) {
    await tx.store.delete(oldId);
    await tx.store.put({ ...existing, id: newId });
  }
  await tx.done;

  const outboxDb = await getDb();
  const entries = await outboxDb.getAll("outbox");
  const outboxTx = outboxDb.transaction("outbox", "readwrite");
  await Promise.all([
    ...entries
      .filter((entry) => entry.targetId === oldId)
      .map((entry) => outboxTx.store.put({ ...entry, targetId: newId })),
    outboxTx.done,
  ]);
}

export function isPendingId(id: string): boolean {
  return isLocalId(id);
}

type TransactionFilters = {
  q?: string;
  type?: "INCOME" | "EXPENSE" | "ALL";
  categoryId?: string | "ALL";
};

/** Mirrors buildTransactionWhere from lib/data/transactions.ts, for offline mode. */
export function filterLocalTransactions(
  rows: LocalTransaction[],
  filters: TransactionFilters
): LocalTransaction[] {
  return rows.filter((row) => {
    if (filters.type && filters.type !== "ALL" && row.type !== filters.type) return false;
    if (
      filters.categoryId &&
      filters.categoryId !== "ALL" &&
      row.categoryId !== filters.categoryId
    ) {
      return false;
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const shopMatch = row.shop?.toLowerCase().includes(q);
      const memoMatch = row.memo?.toLowerCase().includes(q);
      if (!shopMatch && !memoMatch) return false;
    }
    return true;
  });
}

export function paginateLocalTransactions<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
