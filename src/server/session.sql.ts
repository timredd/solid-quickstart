import { nanoid } from "@/db/columns";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { usersTable } from "./user.sql";

export const sessionsTable = sqliteTable("sessions", {
  ...nanoid,
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: integer("expires_at", { mode: "timestamp" })
    .notNull()
    .$type<Date>(),
});

export type NewSession = InferInsertModel<typeof sessionsTable>;
export type Session = InferSelectModel<typeof sessionsTable>;

export function serialize(row: typeof sessionsTable.$inferSelect): Session {
  return {
    id: row.id,
    userId: row.userId,
    expiresAt: row.expiresAt,
  };
}
