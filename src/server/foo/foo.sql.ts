import { createTableWithMetadata } from "@/lib/drizzle";
import { text } from "drizzle-orm/sqlite-core";

export const fooTable = createTableWithMetadata("locations", {
  id: text("id", { length: 5 }).primaryKey().unique(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});
