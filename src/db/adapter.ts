import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./client";
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationsTable,
} from "./schemas/auth";

export const adapter = drizzleAdapter(db, {
  provider: "sqlite",
  schema: {
    user: usersTable,
    session: sessionsTable,
    account: accountsTable,
    verification: verificationsTable,
  },
});
