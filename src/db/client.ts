import { authSchema } from "@/db/schemas/auth";
import { drizzle } from "drizzle-orm/libsql/web";

import type { Config } from "@libsql/client/web";
import type {
  ExtractTableRelationsFromSchema,
  ExtractTablesWithRelations,
} from "drizzle-orm";

const schema = {
  ...authSchema,
};

export type Schema = typeof schema;
export type SchemaWithRelations = ExtractTablesWithRelations<Schema>;

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
