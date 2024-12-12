import { nanoid as nanoidFn } from "@/lib/nanoid";
import { type SQL, sql } from "drizzle-orm";
import { type SQLiteColumn, integer, text } from "drizzle-orm/sqlite-core";

export function now() {
  return sql`CURRENT_TIMESTAMP`;
}

export function nil() {
  return sql`NULL`;
}

/**
 * Returns a query that converts a date time column to an ISO format string.
 * @param date The date time column to convert.
 * @returns The query that converts the date time column to an ISO format string.
 *
 * @example
 * ```ts
 * query.returning({
 *   createdAt: getISOFormatDateQuery(commentsTable.createdAt).as(
 *     "created_at",
 *   ),
 * });
 * ```
 */
export function getISOFormatDateQuery(date: SQLiteColumn): SQL<string> {
  return sql<string>`to_char(${date}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;
}

export const id = {
  get id() {
    return integer("id").notNull().primaryKey({ autoIncrement: true });
  },
};

export const nanoid = {
  get id() {
    return text("id").primaryKey().$defaultFn(nanoidFn);
  },
};

export const timestamps = {
  get createdAt() {
    return integer({ mode: "timestamp" })
      .default(now())
      .notNull()
      .$type<Date>();
  },
  get updatedAt() {
    return integer({ mode: "timestamp" })
      .default(now())
      .$onUpdateFn(() => now())
      .notNull()
      .$type<Date>();
  },
  get deletedAt() {
    return integer({ mode: "timestamp" }).$type<Date>();
  },
};
