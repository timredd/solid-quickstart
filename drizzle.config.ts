import { defineConfig } from "drizzle-kit";

function getCredentials(type?: "remote" | "in-memory" | "file") {
  switch (type) {
    case "remote":
      return {
        url: process.env.DATABASE_URL,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      };
    case "in-memory":
      return {
        url: ":memory:",
      };
    case "file":
      return {
        url: "file:sqlite.db",
      };
    default:
      return {
        url: process.env.DATABASE_URL,
      };
  }
}

export default defineConfig({
  dialect: "sqlite",
  schema: "src/db/schemas.sql.ts",
  out: "drizzle/migrations",
  ...getCredentials(),
});
