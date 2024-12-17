import { type Nanoid, nanoid as createNanoid } from "@/lib/nanoid";
import {
  SQLiteBooleanBuilder,
  SQLiteIntegerBuilder,
  SQLiteTextBuilder,
  SQLiteTextJsonBuilder,
  SQLiteTimestampBuilder,
} from "drizzle-orm/sqlite-core";

export function id(name = "id") {
  return new SQLiteIntegerBuilder(name)
    .primaryKey({ autoIncrement: true })
    .$type<number>();
}

export function nanoid(name = "id") {
  return new SQLiteTextBuilder(name, "text")
    .primaryKey()
    .$defaultFn(() => createNanoid())
    .$type<Nanoid>();
}

export function json(name = "") {
  return new SQLiteTextJsonBuilder(name).$type<Record<string, unknown>>();
}

export function boolean(name = "") {
  return new SQLiteBooleanBuilder(name, "boolean").$type<boolean>();
}

export function datetime(name = "") {
  return new SQLiteTimestampBuilder(name, "timestamp").$type<Date>();
}

export function timestamp(name = "") {
  return new SQLiteTimestampBuilder(name, "timestamp_ms").$type<Date>();
}

export * from "drizzle-orm/sqlite-core";
