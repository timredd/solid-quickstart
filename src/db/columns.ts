import { nanoid as nanoidFn } from "@/lib/nanoid";
import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

export function now() {
  return sql`CURRENT_TIMESTAMP`;
}

export function nil() {
  return sql`NULL`;
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
    return integer("created_at", { mode: "timestamp" })
      .default(now())
      .notNull()
      .$type<Date>();
  },
  get updatedAt() {
    return integer("updated_at", { mode: "timestamp" })
      .default(now())
      .$onUpdateFn(() => now())
      .notNull()
      .$type<Date>();
  },
  get deletedAt() {
    return integer("deleted_at", { mode: "timestamp" }).$type<Date>();
  },
};
