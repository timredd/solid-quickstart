import { db } from "@/db/client";
import {
  type InsertUser,
  InsertUserSchema,
  type User,
  accountsTable,
  sessionsTable,
  usersTable,
} from "@/db/schemas/auth";
import type { TxOrDb } from "@/db/transact";
import { hashPassword } from "@/lib/auth";
import { type Pagination, PaginationSchema } from "@/shared/types";
import { and, asc, desc, eq, like } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import * as v from "valibot";

export async function createUser(user: InsertUser, tx?: TxOrDb) {
  const parsed = v.parse(InsertUserSchema, user);

  const createdUser = await (tx || db)
    .insert(usersTable)
    .values(parsed)
    .returning()
    .then((rows) => rows.at(0));
  if (!createdUser) {
    throw new Error("Failed to create user");
  }

  return createdUser;
}

export async function getUserById(id: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.id, id),
  });
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getUserByEmail(email: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.email, email.toLowerCase()),
  });
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

const UpdateUserSchema = v.partial(InsertUserSchema);

export async function updateUser(
  id: string,
  data: v.InferOutput<typeof UpdateUserSchema>,
) {
  const parsedData = v.parse(UpdateUserSchema, data);

  const updatedUser = await db
    .update(usersTable)
    .set(parsedData)
    .where(eq(usersTable.id, id))
    .returning()
    .then((rows) => rows.at(0));
  if (!updatedUser) {
    throw new Error("Failed to update user");
  }

  return updatedUser;
}

export async function deleteUser(id: string) {
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

  function getSortField(sort: "id" | "created" | "updated"): SQLiteColumn {
    switch (sort) {
      case "created":
        return usersTable.createdAt;
      case "updated":
        return usersTable.updatedAt;
      default:
        return usersTable.id;
    }
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(and(search ? like(usersTable.name, `%${search}%`) : undefined))
    .orderBy((order === "asc" ? asc : desc)(getSortField(sort)))
    .limit(limit)
    .offset((page - 1) * limit);
  if (!users) {
    throw new Error("Failed to list users");
  }

  return users;
}

export async function verifyEmail(id: string) {
  const updatedUser = await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.id, id))
    .returning()
    .then((rows) => rows.at(0));
  if (!updatedUser) {
    throw new Error("Failed to verify email");
  }

  return updatedUser;
}
