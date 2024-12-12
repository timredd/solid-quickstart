/**!
 * Part of this code is taken from and inspired by jacobburgess/sst-tanstack
 * MIT License, Copyright (c) 2024 Jacob Burgess
 *
 * https://github.com/jacobburgess/sst-tanstack
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { db, type schema } from "@/db/client";
import type { ResultSet } from "@libsql/client/web";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type {
  SQLiteTransaction,
  SQLiteTransactionConfig,
} from "drizzle-orm/sqlite-core";

type MaybePromise<T> = T | Promise<T>;

export type Transaction = SQLiteTransaction<
  "sync" | "async",
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

type TxOrDb = Transaction | typeof db;

type TransactionContextType = {
  tx: Transaction;
  effects: Array<() => void>;
};

export function createContext<T>() {
  const storage = new AsyncLocalStorage<T>();

  return {
    use() {
      const result = storage.getStore();
      if (!result) {
        throw new Error("No context available");
      }
      return result;
    },
    with<R>(value: T, fn: () => R) {
      return storage.run<R>(value, fn);
    },
  };
}

const TransactionContext = createContext<TransactionContextType>();

export async function useTransaction<T>(callback: (trx: TxOrDb) => Promise<T>) {
  try {
    const context = TransactionContext.use();
    return callback(context.tx);
  } catch {
    return callback(db);
  }
}

// biome-ignore lint/suspicious/noExplicitAny: Required
export async function afterTx(effect: () => MaybePromise<any>) {
  try {
    const context = TransactionContext.use();
    context.effects.push(effect);
  } catch {
    await effect();
  }
}

export async function createTransaction<T>(
  callback: (tx: Transaction) => Promise<T>,
  behavior: SQLiteTransactionConfig["behavior"] = "deferred",
): Promise<T> {
  try {
    const context = TransactionContext.use();
    return callback(context.tx);
  } catch {
    const effects: Array<() => void> = [];
    const result = await db.transaction(
      async (tx) =>
        TransactionContext.with({ tx, effects }, () => callback(tx)),
      { behavior: behavior },
    );
    await Promise.all(effects.map((x) => x()));
    return result as T;
  }
}
