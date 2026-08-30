import type { Category } from "@prisma/client";
import type { SerializedTransaction } from "@/lib/data/transactions";
import type { TransactionInput } from "@/lib/validations/transaction";

export type SyncStatus = "synced" | "pending";

export type LocalTransaction = SerializedTransaction & {
  category: Category;
  syncStatus: SyncStatus;
};

export type OutboxEntry =
  | {
      localOpId: string;
      type: "create";
      targetId: string;
      payload: TransactionInput;
      createdAt: number;
      attempts: number;
      lastError?: string;
    }
  | {
      localOpId: string;
      type: "update";
      targetId: string;
      payload: TransactionInput;
      createdAt: number;
      attempts: number;
      lastError?: string;
    }
  | {
      localOpId: string;
      type: "delete";
      targetId: string;
      createdAt: number;
      attempts: number;
      lastError?: string;
    };

export const LOCAL_ID_PREFIX = "local_";

export function isLocalId(id: string): boolean {
  return id.startsWith(LOCAL_ID_PREFIX);
}
