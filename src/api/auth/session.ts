import { db } from "@/db/client";
import {
  type Session,
  type User,
  sessionsTable,
  usersTable,
} from "@/db/schemas/auth";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";

export type UserSession =
  | { session: Session; user: User }
  | { session: null; user: null };

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const session = await db
    .insert(sessionsTable)
    .values({
      id: sessionId,
      token,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    })
    .returning()
    .then((rows) => rows.at(0));
  if (!session) {
    throw new Error("Failed to create session");
  }
  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<UserSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db
    .select({ user: usersTable, session: sessionsTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.id, sessionId))
    .then((rows) => rows.at(0));
  if (!result) {
    return { session: null, user: null };
  }
  const { user, session } = result;

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionsTable)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessionsTable.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
}
