import { type Nanoid, nanoid as createNanoid } from "@/lib/nanoid";
import {
  SQLiteBooleanBuilder,
  SQLiteIntegerBuilder,
  SQLiteTextBuilder,
  SQLiteTextJsonBuilder,
  SQLiteTimestampBuilder,
} from "drizzle-orm/sqlite-core";

export function id<TName extends string = "id">(name?: TName) {
  return new SQLiteIntegerBuilder(name ?? "id")
    .primaryKey({ autoIncrement: true })
    .$type<number>();
}

export function nanoid<TName extends string = "nanoid">(name?: TName) {
  return new SQLiteTextBuilder(name ?? "nanoid", "text")
    .primaryKey()
    .$defaultFn(() => createNanoid())
    .$type<Nanoid>();
}

export function json<TName extends string>(name?: TName) {
  return new SQLiteTextJsonBuilder(name ?? "").$type<Record<string, unknown>>();
}

export function boolean<TName extends string>(name?: TName) {
  return new SQLiteBooleanBuilder(name ?? "", "boolean").$type<boolean>();
}

export function datetime<TName extends string>(name?: TName) {
  return new SQLiteTimestampBuilder(name ?? "", "timestamp").$type<Date>();
}

export function timestamp<TName extends string>(name?: TName) {
  return new SQLiteTimestampBuilder(name ?? "", "timestamp_ms").$type<Date>();
}

export * from "drizzle-orm/sqlite-core";
