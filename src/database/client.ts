// import { schema } from "@/db/schema";
// import { drizzle } from "drizzle-orm/libsql/web";
//
// import type { Schema } from "@/db/schema";
// import type { Config } from "@libsql/client/web";
// import type { ExtractTableRelationsFromSchema } from "drizzle-orm";
//
// export type ExtractRelations<TTableName extends string> = Record<
//   keyof ExtractTableRelationsFromSchema<Schema, TTableName>,
//   true | undefined
// >;
//
// export function createDrizzleClient(config?: Config) {
//   return drizzle<Schema>({
//     connection: {
//       url: process.env.DATABASE_URL,
//       authToken: process.env.DATABASE_AUTH_TOKEN,
//       ...config,
//     },
//     schema,
//   });
// }
//
// export const db = createDrizzleClient();
//
// export type Database = ReturnType<typeof createDrizzleClient>;

import { drizzle } from "drizzle-orm/libsql/web";

import type { Config } from "@libsql/client/web";
import type { FetchEvent } from "@solidjs/start/server";

import { type Schema, schema } from "@/database/schema";

export function createDrizzleClient(config?: Config) {
  return drizzle<Schema>({
    connection: {
      url: import.meta.env.DATABASE_URL ?? "http://127.0.0.1:8080",
      authToken: import.meta.env.DATABASE_AUTH_TOKEN,
      ...config,
    },
    schema,
  });
}

export function createDrizzleMiddleware(event: FetchEvent) {
  return drizzle<Schema>({
    connection: {
      url: event.locals.env.DATABASE_URL,
      authToken: event.locals.env.DATABASE_AUTH_TOKEN,
    },
    schema,
  });
}

export const db = createDrizzleClient();

export type Database = ReturnType<typeof createDrizzleClient>;
