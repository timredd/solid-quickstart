import { db } from "@/db/client";
import type { Account } from "@/db/schemas/auth";

async function getUserAccounts(userId: string): Promise<Account[]> {
  const accounts = await db.query.accounts.findMany({
    where: (t, { eq }) => eq(t.userId, userId),
  });
  if (!accounts) {
    throw new Error("Failed to get user accounts");
  }

  return accounts;
}
