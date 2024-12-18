import { schema } from "@/db/schema";
import { drizzle } from "drizzle-orm/libsql/web";
import { reset as drizzleReset, seed as drizzleSeed } from "drizzle-seed";

export function createTestDatabase() {
  const db = drizzle({
    connection: {
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  });

  return {
    db,
    seed: (options?: {
      count?: number;
      seed?: number;
    }) => drizzleSeed(db, schema, options),
    reset: async () => drizzleReset(db, schema),
  };
}
