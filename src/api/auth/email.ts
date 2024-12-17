import { db } from "@/db/client";
import { usersTable } from "@/db/schemas/auth";
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
  const emailsCount = await db
    .select({ emailsCount: count(usersTable.email) })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .groupBy(usersTable.email)
    .having(({ emailsCount }) => gt(emailsCount, 1))
    .then((rows) => rows.at(0));
  if (!emailsCount) {
    return true;
  }
  return false;
}
