import { id, timestamps } from "@/db/columns";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  ...id,
  ...timestamps,
});

export type NewUser = InferInsertModel<typeof usersTable>;
export type User = InferSelectModel<typeof usersTable>;
