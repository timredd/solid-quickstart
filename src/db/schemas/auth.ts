import { createInsertSchema, createSelectSchema } from "@/lib/drizzle-valibot";
import { createdAt, updatedAt } from "@/lib/drizzle/columns";
import { NanoIdSchema } from "@/lib/valibot";
import { relations } from "drizzle-orm";

import * as t from "@/lib/drizzle/table";
import * as v from "valibot";

export const usersTable = t.sqliteTable("users", {
  id: t.nanoid(),
  /** User's chosen display name */
  name: t.text().notNull(),
  /** User's email address for communication and login */
  email: t.text().notNull(),
  /** User's username for communication and login */
  username: t.text().notNull(),
  /** Whether the user's email is verified */
  emailVerified: t.boolean().notNull(),
  /** User's image url */
  image: t.text(),
  /** Timestamp of when the user account was created */
  createdAt,
  /** Timestamp of the last update to the user's information */
  updatedAt,
});

export const usersRelations = relations(usersTable, ({ one }) => ({
  session: one(sessionsTable, {
    fields: [usersTable.id],
    references: [sessionsTable.userId],
  }),
  account: one(accountsTable, {
    fields: [usersTable.id],
    references: [accountsTable.userId],
  }),
}));

export const InsertUserSchema = createInsertSchema(usersTable, {
  email: ({ email }) =>
    v.pipe(
      email,
      v.transform((input) => input.toLowerCase()),
      v.email("Invalid email"),
    ),
  emailVerified: ({ emailVerified }) => v.fallback(emailVerified, false),
  image: ({ image }) => v.nullish(image),
  username: ({ email }) =>
    v.pipe(
      email,
      v.transform((input) => input.split("@")[0]),
      v.string(),
    ),
});
export const SelectUserSchema = createSelectSchema(usersTable, {
  id: NanoIdSchema,
  email: ({ email }) => v.pipe(email, v.email("Invalid email")),
  emailVerified: ({ emailVerified }) => v.fallback(emailVerified, false),
  image: ({ image }) => v.nullish(image),
});
export const UserIdSchema = v.pick(SelectUserSchema, ["id"]);
export type InsertUser = v.InferInput<typeof InsertUserSchema>;
export type SelectUser = v.InferInput<typeof SelectUserSchema>;
export type NewUser = v.InferOutput<typeof InsertUserSchema>;
export type User = v.InferOutput<typeof SelectUserSchema>;
export type UserId = v.InferOutput<typeof UserIdSchema>["id"];

export const sessionsTable = t.sqliteTable("sessions", {
  /** Unique identifier for each session */
  id: t.nanoid(),
  /** The id of the user */
  userId: t
    .text()
    .references(() => usersTable.id)
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

export const InsertSessionSchema = createInsertSchema(sessionsTable, {
  ipAddress: v.nullable(v.pipe(v.string(), v.ipv4())),
  userAgent: v.nullable(v.string()),
});
export const SelectSessionSchema = createSelectSchema(sessionsTable, {
  id: NanoIdSchema,
  ipAddress: v.nullable(v.pipe(v.string(), v.ipv4())),
  userAgent: v.nullable(v.string()),
});

export type InsertSession = v.InferInput<typeof InsertSessionSchema>;
export type SelectSession = v.InferInput<typeof SelectSessionSchema>;
export type NewSession = v.InferOutput<typeof InsertSessionSchema>;
export type Session = v.InferOutput<typeof SelectSessionSchema>;

export const accountsTable = t.sqliteTable("accounts", {
  /** Unique identifier for each account */
  id: t.nanoid(),
  /** The id of the user */
  userId: t
    .text()
    .references(() => usersTable.id)
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
  /** The password of the account. Mainly used for email and password authentication */
  passwordHash: t.text(),
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

export const InsertAccountSchema = createInsertSchema(accountsTable);
export const SelectAccountSchema = createSelectSchema(accountsTable, {
  id: NanoIdSchema,
  accessToken: ({ accessToken }) => v.nullable(accessToken),
  refreshToken: ({ refreshToken }) => v.nullable(refreshToken),
});

export type InsertAccount = v.InferInput<typeof InsertAccountSchema>;
export type SelectAccount = v.InferInput<typeof SelectAccountSchema>;
export type NewAccount = v.InferOutput<typeof InsertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;

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

export const InsertVerificationSchema = createInsertSchema(verificationsTable);
export const SelectVerificationSchema = createSelectSchema(verificationsTable, {
  id: NanoIdSchema,
});

export type InsertVerification = v.InferInput<typeof InsertVerificationSchema>;
export type SelectVerification = v.InferInput<typeof SelectVerificationSchema>;
export type NewVerification = v.InferOutput<typeof InsertVerificationSchema>;
export type Verification = v.InferOutput<typeof SelectVerificationSchema>;

export const authSchema = {
  users: usersTable,
  usersRelations,
  sessions: sessionsTable,
  sessionsRelations,
  accounts: accountsTable,
  accountsRelations,
  verifications: verificationsTable,
};

export type AuthSchema = typeof authSchema;
