import { createTableWithMetadata } from "@/lib/drizzle";
import { text } from "drizzle-orm/sqlite-core";

export const fooTable = createTableWithMetadata("foo", {
  key: text("key").notNull(),
  value: text("value").notNull(),
});
