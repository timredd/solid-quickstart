import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import type { Session } from "./session.sql";
import { sessionsTable } from "./session.sql";
import type { User } from "./user.sql";
import { usersTable } from "./user.sql";

/**
 * Converts a number of days to milliseconds.
 *
 * @param num - The number of days to convert.
 * @returns The equivalent number of milliseconds.
 */
function days(num: number): number {
  return num * 24 * 60 * 60 * 1000;
}

type ActiveSession = {
  user: User;
  session: Session;
};

type ExpiredSession = {
  user: null;
  session: null;
};

function encodeBase32LowerCaseNoPadding(bytes: Uint8Array): string {
  return "PLACEHOLDER";
}

function encodeHexLowerCase(bytes: Uint8Array): string {
  return "PLACEHOLDER";
}

function sha256(bytes: Uint8Array): Uint8Array {
  return new Uint8Array(20);
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

/**
 * Creates a new session for a user.
 *
 * This function generates a session ID from the provided token, sets the session
 * expiration date to 30 days from now, and inserts the new session into the database.
 *
 * @param token - The session token to generate the session ID.
 * @param userId - The ID of the user for whom the session is being created.
 * @returns A promise that resolves to the newly created session object.
 */
export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + days(30));
  const session: Session = { id, userId, expiresAt };

  await db.insert(sessionsTable).values(session);
  return session;
}

/**
 * Validates a session token.
 *
 * This function performs the following steps:
 * 1. Generates a session ID from the provided token.
 * 2. Finds the session and associated user by the session ID.
 * 3. Checks if the session is expired and invalidates it if so.
 * 4. If the session is close to expiry (within 15 days), extends the session by 30 days.
 * 5. Returns the session and user information.
 *
 * @param token - The session token to validate.
 * @returns A promise that resolves to an object containing the session and user information.
 *          If the session is expired, both session and user will be null.
 */
export async function validateSessionToken(
  token: string,
): Promise<ActiveSession | ExpiredSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const [{ session, user }] = await db
    .select({ user: usersTable, session: sessionsTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.id, sessionId));

  const isExpired = Date.now() >= session.expiresAt.getTime();
  if (isExpired) {
    await invalidateSession(sessionId);
    return { user: null, session: null };
  }

  const isCloseToExpiry = Date.now() >= session.expiresAt.getTime() - days(15);
  if (isCloseToExpiry) {
    session.expiresAt = new Date(Date.now() + days(30));
    await db
      .update(sessionsTable)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessionsTable.id, sessionId));
  }

  return { session, user };
}

/**
 * Invalidates a session by deleting it from the database.
 *
 * This function deletes the session associated with the provided session ID
 * from the sessions table in the database.
 *
 * @param sessionId - The ID of the session to invalidate.
 * @returns A promise that resolves when the session has been deleted.
 */
async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}
