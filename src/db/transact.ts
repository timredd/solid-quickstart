/**!
 * Part of this code is taken from and inspired by jacobburgess/sst-tanstack
 * MIT License, Copyright (c) 2024 Jacob Burgess
 *
 * https://github.com/jacobburgess/sst-tanstack
 */

import { db, type schema } from "@/db/client";
import { createContext } from "@/db/context";
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
