import { schema } from "@/db/schema";
import { drizzle } from "drizzle-orm/libsql/web";

import type { Schema } from "@/db/schema";
import type { Config } from "@libsql/client/web";
import type { ExtractTableRelationsFromSchema } from "drizzle-orm";

export type ExtractRelations<TTableName extends string> = Record<
  keyof ExtractTableRelationsFromSchema<Schema, TTableName>,
  true | undefined
>;

export function createDrizzleClient(config?: Config) {
  return drizzle<Schema>({
    connection: {
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
      ...config,
    },
    schema,
  });
}

export const db = createDrizzleClient();

export type Database = ReturnType<typeof createDrizzleClient>;
