import { authSchema } from "@/schema/auth";
import { drizzle } from "drizzle-orm/libsql/web";

import type { Config } from "drizzle-kit";

export function createDrizzleClient(config?: Config) {
  return drizzle({
    connection: {
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
      ...config,
    },
    schema: {
      ...authSchema,
    },
  });
}

export const db = createDrizzleClient();

export type Database = typeof db;
