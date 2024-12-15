import { authSchema } from "@/db/schemas/auth";
import { drizzle } from "drizzle-orm/libsql/web";

import type { Config } from "drizzle-kit";

const schema = {
  ...authSchema,
};

export type Schema = typeof schema;

export function createDrizzleClient(config?: Config) {
  return drizzle({
    connection: {
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
      ...config,
    },
    schema,
  });
}

export const db = createDrizzleClient();

export type Database = typeof db;
