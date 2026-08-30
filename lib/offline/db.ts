import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Category } from "@prisma/client";
import type { LocalTransaction, OutboxEntry } from "./types";

interface ExpensoDB extends DBSchema {
  transactions: {
    key: string;
    value: LocalTransaction;
  };
  categories: {
    key: string;
    value: Category;
  };
  outbox: {
    key: string;
    value: OutboxEntry;
    indexes: { "by-createdAt": number };
  };
  meta: {
    key: string;
    value: { key: string; userId: string };
  };
}

const DB_NAME = "expenso-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ExpensoDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<ExpensoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ExpensoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("transactions", { keyPath: "id" });
        db.createObjectStore("categories", { keyPath: "id" });
        const outbox = db.createObjectStore("outbox", { keyPath: "localOpId" });
        outbox.createIndex("by-createdAt", "createdAt");
        db.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

export type { ExpensoDB };
