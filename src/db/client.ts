import type { Config } from "drizzle-kit";
import { drizzle } from "drizzle-orm/libsql/web";

// Import all schema files here
// import * as fooSchema from "@/server/foo/foo.sql";

export const schema = {
  // ...locationsSchema,
};
export type Schema = typeof schema;

export const createDrizzleClient = (config?: Config) => {
  const db = drizzle({
    connection: {
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
      ...config,
    },
    schema,
  });

  return db;
};

export const db = createDrizzleClient();

export type Database = typeof db;
