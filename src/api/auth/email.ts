import { db } from "@/db/client";
import { usersTable } from "@/db/schema/auth";
import { EmailSchema } from "@/shared/types";
import { count, eq, gt } from "drizzle-orm";

import * as v from "valibot";

export function verifyEmailInput(email: string): boolean {
  try {
    v.parse(EmailSchema, email);
    return true;
  } catch (e) {
    return false;
  }
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const emails = await db
    .select({ count: count(usersTable.email) })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .groupBy(usersTable.email)
    .having(({ count }) => gt(count, 1))
    .then((rows) => rows.at(0));
  if (!emails || emails?.count > 0) {
    return false;
  }

  return true;
}
