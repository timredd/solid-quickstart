import { sql } from "drizzle-orm";
import type { AnySQLiteColumn, SQLiteSelect } from "drizzle-orm/sqlite-core";

export type Tuple<T extends string = string> = readonly [T, ...T[]];

/**
 * A SQL fragment that represents the current timestamp.
 */
export const NOW = sql<Date>`strftime('%s', 'now')`;

/**
 * Generates a SQL fragment that converts the specified column to lowercase.
 *
 * @param column - The column to be converted to lowercase.
 * @returns A SQL fragment that converts the column to lowercase.
 */
export function lower(column: AnySQLiteColumn) {
  return sql`lower(${column})`;
}

/**
 * Generates a SQL fragment that converts the specified column to uppercase.
 *
 * @param column - The column to be converted to uppercase.
 * @returns A SQL fragment that converts the column to uppercase.
 */
export function upper(column: AnySQLiteColumn) {
  return sql`upper(${column})`;
}

/**
 * Generates a SQL fragment that references a column in the excluded table.
 *
 * @param column - The column to reference.
 * @returns A SQL fragment that references the column in the excluded table.
 */
export function excluded(column: AnySQLiteColumn) {
  return sql.raw(`excluded.${column.name}`);
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
export function getISOFormatDateQuery(date: AnySQLiteColumn) {
  return sql<string>`to_char(${date}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;
}

/**
 * Creates an array of enum values from a given shape.
 * This is required to correctly type Drizzle's enum columns.
 *
 * @param shape - An enum shape.
 * @returns An array of correctly typed enum values.
 */
export function enumerate<A extends string>(shape: Array<A>): Tuple<A>;
export function enumerate<V extends string>(shape: Record<string, V>): Tuple<V>;
export function enumerate(shape: Array<string> | Record<string, string>) {
  const array = Array.isArray(shape) ? shape : Object.values(shape);
  return array as [string, ...string[]];
}

/**
 * Adds pagination to a query.
 * Requires the query to be in `$dynamic` mode.

 * @param qb Query builder query to paginate.
 * @param page Page number to fetch.
 * @param opts Pagination options.
 * @returns Query with pagination applied.
 */
export function withPagination<T extends SQLiteSelect>(
  qb: T,
  page: number,
  opts: { size?: number },
) {
  const { size = 20 } = opts;
  return qb.limit(page).offset(page * size);
}
