import { type Config, createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

// Import all schema files here
// import * as fooSchema from "@/server/foo/foo.sql";

export const schema = {
  // ...locationsSchema,
};
export type Schema = typeof schema;

export const createDrizzleClient = (config?: Config) => {
  const client = createClient({
    // url: config?.url ?? import.meta.env.DATABASE_URL,
    // authToken: config?.authToken ?? import.meta.env.DATABASE_AUTH_TOKEN,
    url: "http://127.0.0.1:8080",
    ...config,
  });

  return drizzle(client, { schema });
};

export const db = createDrizzleClient();
export type Database = typeof db;
