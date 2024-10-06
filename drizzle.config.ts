import type { Config } from "drizzle-kit";

export default {
  strict: true,
  verbose: true,
  out: "./migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL || "http://127.0.0.1:8080",
  },
  schema: "./src/**/*.sql.ts",
} satisfies Config;
