import { type Database, createDrizzleClient } from "./client";

async function seed() {
  const db = createDrizzleClient({
    url: process.env.DATABASE_URL ?? "http://localhost:3000",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const { rowsAffected: numEntries } = await mockSeedFunction({ db });
  console.log(`Seeded ${numEntries} entries`);
}

async function mockSeedFunction(options: { db: Database }) {
  return {
    rowsAffected: 1,
  };
}

seed();
