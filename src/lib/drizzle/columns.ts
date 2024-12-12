import { integer } from "drizzle-orm/sqlite-core";
import { NOW } from "./helpers";

export const createdAt = integer({ mode: "timestamp" })
  .$defaultFn(() => NOW)
  .notNull();

export const updatedAt = integer({ mode: "timestamp" })
  .$defaultFn(() => NOW)
  .$onUpdateFn(() => NOW)
  .notNull();

export const deletedAt = integer({ mode: "timestamp" });

export const timestamps = {
  createdAt,
  updatedAt,
  deletedAt,
};
