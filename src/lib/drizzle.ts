import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  type SQLiteColumnBuilderBase,
  integer,
  sqliteTable,
} from "drizzle-orm/sqlite-core";

/**
 * Creates a SQLite table with metadata fields.
 *
 * @param name - The name of the table.
 * @param fields - The fields of the table excluding metadata fields.
 * @returns The created SQLite table with metadata fields.
 *
 * The table will include the following metadata fields:
 * - id: Primary key with auto-increment.
 * - createdAt: Timestamp of when the record was created.
 * - updatedAt: Timestamp of when the record was last updated.
 */
export function createTableWithMetadata<
  T extends Record<string, SQLiteColumnBuilderBase>,
>(name: string, fields: T) {
  return sqliteTable(name, {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...fields,
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull()
      .$type<Date>(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(strftime('%s', 'now'))`)
      .$onUpdateFn(() => sql`(strftime('%s', 'now'))`)
      .notNull()
      .$type<Date>(),
  });
}
/**
 * Generates a SQL fragment that converts the specified column to lowercase.
 *
 * @param col - The column to be converted to lowercase.
 * @returns A SQL fragment that converts the column to lowercase.
 */
export function lower(col: AnySQLiteColumn) {
  return sql`lower(${col})`;
}

/**
 * Generates a SQL fragment that converts the specified column to uppercase.
 *
 * @param col - The column to be converted to uppercase.
 * @returns A SQL fragment that converts the column to uppercase.
 */
export function upper(col: AnySQLiteColumn) {
  return sql`upper(${col})`;
}

/**
 * Creates an array of enum values from a given shape.
 * This is required to correctly type Drizzle's enum columns.
 *
 * @param shape - An enum shape.
 * @returns An array of correctly typed enum values.
 */
export function createEnum<T extends string>(
  shape: Record<string, T>,
): [T, ...T[]] {
  return Object.values(shape) as [T, ...T[]];
}
