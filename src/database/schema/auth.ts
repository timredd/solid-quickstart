import { createdAt, updatedAt } from "@/lib/drizzle";
import { relations } from "drizzle-orm";

import * as t from "@/lib/drizzle";

export const usersTable = t.sqliteTable(
  "users",
  {
    /** Unique identifier for each user */
    id: t.nanoid(),
    /** User's chosen display name */
    name: t.text().notNull(),
    /** User's email address for communication and login */
    email: t.text().notNull().unique(),
    /** Whether the user's email is verified */
    emailVerified: t.boolean().notNull().default(false),
    /** User's image url */
    image: t.text(),
    /** Timestamp of when the user account was created */
    createdAt,
    /** Timestamp of the last update to the user's information */
    updatedAt,
  },
  (table) => [t.uniqueIndex("email_unq_idx").on(table.email)],
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  account: many(accountsTable),
  session: many(sessionsTable),
}));

export const sessionsTable = t.sqliteTable("sessions", {
  /** Unique identifier for each session */
  id: t.nanoid(),
  /** The id of the user */
  userId: t
    .text()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  /** The unique session token */
  token: t.text().notNull(),
  /** The time when the session expires */
  expiresAt: t.datetime().notNull(),
  /** The IP address of the device */
  ipAddress: t.text(),
  /** The user agent information of the device */
  userAgent: t.text(),
  /** Timestamp of when the session was created */
  createdAt,
  /** Timestamp of when the session was updated */
  updatedAt,
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const accountsTable = t.sqliteTable("accounts", {
  /** Unique identifier for each account */
  id: t.nanoid(),
  /** The id of the user */
  userId: t
    .text()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  /** The id of the account as provided by the SSO or equal to userId for credential accounts */
  accountId: t.text().notNull(),
  /** The id of the provider */
  providerId: t.text().notNull(),
  /** The access token of the account. Returned by the provider */
  accessToken: t.text(),
  /** The refresh token of the account. Returned by the provider */
  refreshToken: t.text(),
  /** The time when the verification request expires */
  accessTokenExpiresAt: t.datetime(),
  /** The time when the verification request expires */
  refreshTokenExpiresAt: t.datetime(),
  /** The scope of the account. Returned by the provider */
  scope: t.text(),
  /** The password of the account. */
  password: t.text().notNull(),
  /** Timestamp of when the account was created */
  createdAt,
  /** Timestamp of when the account was updated */
  updatedAt,
});

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));

export const verificationsTable = t.sqliteTable("verifications", {
  /** Unique identifier for each verification */
  id: t.nanoid(),
  /** The identifier for the verification request */
  identifier: t.text().notNull(),
  /** The value to be verified */
  value: t.text().notNull(),
  /** The time when the verification request expires */
  expiresAt: t.datetime().notNull(),
  /** Timestamp of when the verification request was created */
  createdAt,
  /** Timestamp of when the verification request was updated */
  updatedAt,
});
