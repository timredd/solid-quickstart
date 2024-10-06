import { nanoid } from "@/lib/nanoid";
import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  type SQLiteColumnBuilderBase,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * Creates a SQLite table with metadata fields.
 *
 * @param name - The name of the table.
 * @param fields - The fields of the table excluding metadata fields.
 * @param options - The options for the table.
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
    ...withId(),
    ...fields,
    ...withTimestamps(),
  });
}

type IdKind = "integer" | "nanoid" | "external";

export function withId<Kind extends IdKind>(
  options?: Kind extends "integer"
    ? {
        kind: Kind;
        length?: never;
        autoIncrement?: boolean;
      }
    : Kind extends "nanoid" | "external"
      ? {
          kind: Kind;
          length?: number;
          autoIncrement?: never;
        }
      : never,
) {
  switch (options?.kind) {
    case "nanoid": {
      return {
        id: text("id", { length: options.length })
          .primaryKey()
          .$defaultFn(nanoid),
      };
    }
    case "external": {
      return {
        id: text("id", { length: options.length }).primaryKey(),
      };
    }
    default: {
      return {
        id: integer("id").primaryKey({
          autoIncrement: options?.autoIncrement ?? undefined,
        }),
      };
    }
  }
}

export function withTimestamps(options?: {
  createdAt?: boolean;
  updatedAt?: boolean;
}) {
  const createdAt = integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull()
    .$type<Date>();
  const updatedAt = integer("updated_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdateFn(() => sql`(strftime('%s', 'now'))`)
    .notNull()
    .$type<Date>();

  const withCreatedAt = options?.createdAt ?? true;
  const withUpdatedAt = options?.updatedAt ?? true;

  return {
    ...(withCreatedAt ? createdAt : {}),
    ...(withUpdatedAt ? updatedAt : {}),
  };
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
