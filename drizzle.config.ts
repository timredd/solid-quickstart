import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
      ? process.env.DATABASE_AUTH_TOKEN
      : undefined,
  },
  out: "drizzle/migrations",
  schema: "src/db/schema",
});
