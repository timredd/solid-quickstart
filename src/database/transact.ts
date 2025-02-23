/**!
 * Part of this code is taken from and inspired by jacobburgess/sst-tanstack
 * MIT License, Copyright (c) 2024 Jacob Burgess
 *
 * https://github.com/jacobburgess/sst-tanstack
 */

import { type Database, db } from "@/database/client";
import type { Schema } from "@/database/schema";
import type { Context } from "@/server/router";
import type { ResultSet } from "@libsql/client/web";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type {
  SQLiteTransaction,
  SQLiteTransactionConfig,
} from "drizzle-orm/sqlite-core";
import type { Context as HonoContext } from "hono";
import { getContext } from "hono/context-storage";

export type Transaction = SQLiteTransaction<
  "sync" | "async",
  ResultSet,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

export type TxOrDb = Transaction | Database;

export type TransactionContextType = {
  tx: Transaction;
  effects: Array<() => void>;
};

export async function createTx<T>(
  c: HonoContext,
  callback: (tx: Transaction) => Promise<T>,
  config: SQLiteTransactionConfig = { behavior: "deferred" },
): Promise<T> {
  try {
    const context = getContext<Context>();
    return callback(context.var.transact.tx);
  } catch {
    const effects: Array<() => void> = [];
    const result = await db.transaction(async (tx) => {
      c.set("transact", { tx, effects });
      return callback(tx);
    }, config);
    await Promise.all(effects.map((x) => x()));
    return result as T;
  }
}

export async function useTx<T>(callback: (trx: TxOrDb) => Promise<T>) {
  try {
    const context = getContext<Context>();
    return callback(context.var.transact.tx);
  } catch {
    return callback(db);
  }
}

export async function afterTx<T>(effect: () => Promise<T>) {
  try {
    const context = getContext<Context>();
    context.var.transact.effects.push(effect);
  } catch {
    await effect();
  }
}
