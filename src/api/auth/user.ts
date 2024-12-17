import { db } from "@/db/client";
import {
  type Account,
  type NewUser,
  type Session,
  type UpdateUser,
  type User,
  accountsTable,
  sessionsTable,
  usersTable,
} from "@/db/schemas/auth";
import { type Pagination, PaginationSchema } from "@/shared/types";
import { asc, desc, eq } from "drizzle-orm";

import * as v from "valibot";

export async function createUser(user: NewUser) {
  const createdUser = await db
    .insert(usersTable)
    .values(user)
    .returning()
    .then((rows) => rows.at(0));
  if (!createdUser) {
    throw new Error("Failed to create user");
  }

  return createdUser;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const user = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.id, id),
  });

  return user;
}

export async function getUserByEmail(
  email: string,
  relations?: undefined,
): Promise<User | undefined>;
export async function getUserByEmail(
  email: string,
  relations?: {
    account: true;
  },
): Promise<(User & { account: Account }) | undefined>;
export async function getUserByEmail(
  email: string,
  relations?: {
    session: true;
  },
): Promise<(User & { session: Session }) | undefined>;
export async function getUserByEmail(
  email: string,
  relations?: {
    account?: true;
    session?: true;
  },
): Promise<User & { account: Account; session: Session }> {
  const user = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.email, email.toLowerCase()),
    with: {
      account: relations?.account,
      session: relations?.session,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Ensure that password hash is not returned
  const { passwordHash: _, ...account } = user.account;
  return { ...user, account: account };
}

export async function updateUser(
  id: string,
  user: UpdateUser,
): Promise<User | undefined> {
  const updatedUser = await db
    .update(usersTable)
    .set(user)
    .where(eq(usersTable.id, id))
    .returning()
    .then((rows) => rows.at(0));

  return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    // Delete user's sessions
    await tx.delete(sessionsTable).where(eq(sessionsTable.userId, id));
    // Delete user's accounts
    await tx.delete(accountsTable).where(eq(accountsTable.userId, id));
    // Delete user
    await tx.delete(usersTable).where(eq(usersTable.id, id));
  });
}

export async function listUsers(pagination?: Pagination) {
  const { limit, order, page, search, sort } = v.parse(
    PaginationSchema,
    pagination,
  );

  let sortField = undefined;
  if (sort === "created") {
    sortField = usersTable.createdAt;
  } else if (sort === "updated") {
    sortField = usersTable.updatedAt;
  }

  return db.query.users.findMany({
    where: (t, { like }) => (search ? like(t.name, `%${search}%`) : undefined),
    orderBy: sortField && (order === "asc" ? asc(sortField) : desc(sortField)),
    limit,
    offset: (page - 1) * limit,
  });
}

export async function verifyEmail(id: string): Promise<User | undefined> {
  return db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.id, id))
    .returning()
    .then((rows) => rows.at(0));
}
