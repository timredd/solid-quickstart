import { db } from "@/db/client";
import type { Account } from "@/db/schemas/auth";

export async function getUserAccount(userId: string): Promise<Account> {
  const account = await db.query.accounts.findFirst({
    where: (t, { and, eq }) =>
      and(eq(t.userId, userId), eq(t.providerId, "credential")),
  });
  if (!account) {
    throw new Error("Failed to get user account");
  }

  return account;
}

export async function getUserAccounts(userId: string): Promise<Account[]> {
  const accounts = await db.query.accounts.findMany({
    where: (t, { eq }) => eq(t.userId, userId),
  });
  if (!accounts) {
    throw new Error("Failed to get user accounts");
  }

  return accounts;
}
