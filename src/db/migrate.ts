import { migrate as drizzleMigrate } from "drizzle-orm/libsql/migrator";
import { db } from "./client";

const migrate = async () => {
  try {
    await drizzleMigrate(db, {
      migrationsFolder: "./migrations",
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
