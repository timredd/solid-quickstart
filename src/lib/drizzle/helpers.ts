import { sql } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

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
export function lower<TColumn extends AnySQLiteColumn>(column: TColumn) {
  return sql`lower(${column})`;
}

/**
 * Generates a SQL fragment that converts the specified column to uppercase.
 *
 * @param column - The column to be converted to uppercase.
 * @returns A SQL fragment that converts the column to uppercase.
 */
export function upper<TColumn extends AnySQLiteColumn>(column: TColumn) {
  return sql`upper(${column})`;
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
