import { createdAt, updatedAt } from "@/lib/drizzle/columns";
import { type ExtractTablesWithRelations, relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";

import * as t from "@/lib/drizzle/table";
import * as v from "valibot";

export const usersTable = t.sqliteTable(
  "users",
  {
    /** Unique identifier for each user */
    id: t.nanoid(),
    /** User's chosen display name */
    name: t.text().notNull(),
    /** User's email address for communication and login */
    email: t.text().notNull(),
    /** User's username for communication and login */
    username: t.text(),
    /** Whether the user's email is verified */
    emailVerified: t.boolean().notNull(),
    /** User's image url */
    image: t.text(),
    /** Timestamp of when the user account was created */
    createdAt,
    /** Timestamp of the last update to the user's information */
    updatedAt,
  },
  (table) => ({
    emailUnqIdx: t.uniqueIndex("email_unq_idx").on(table.email),
    usernameUnqIdx: t.uniqueIndex("username_unq_idx").on(table.username),
  }),
);

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
  email: (schema) =>
    v.pipe(
      schema,
      v.transform((input) => input.toLowerCase()),
      v.email("Invalid email"),
    ),
  emailVerified: (schema) => v.fallback(schema, false),
  image: (schema) => v.nullish(schema),
  username: (schema) =>
    v.pipe(
      schema,
      v.minLength(3, "Username must be at least 3 characters"),
      v.maxLength(31, "Username must be at most 31 characters"),
      v.regex(
        /^[a-zA-Z0-9_]+$/,
        "Username must only contain letters, numbers, and underscores",
      ),
    ),
});
export const SelectUserSchema = createSelectSchema(usersTable);
export const UserIdSchema = v.pick(SelectUserSchema, ["id"]);

export type NewUser = v.InferInput<typeof InsertUserSchema>;
export type User = v.InferInput<typeof SelectUserSchema>;
export type UserId = v.InferInput<typeof UserIdSchema>["id"];

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

export const InsertSessionSchema = createInsertSchema(sessionsTable, {
  ipAddress: (schema) => v.pipe(schema, v.ipv4()),
});
export const SelectSessionSchema = createSelectSchema(sessionsTable);

export type NewSession = v.InferInput<typeof InsertSessionSchema>;
export type Session = v.InferInput<typeof SelectSessionSchema>;

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
  passwordHash: t.text().notNull(),
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

export const InsertAccountSchema = createInsertSchema(accountsTable, {
  passwordHash: (schema) =>
    v.nonOptional(
      v.pipe(
        schema,
        v.minLength(3, "Password must be at least 3 characters"),
        v.maxLength(255, "Password must be at most 255 characters"),
      ),
    ),
});
export const SelectAccountSchema = createSelectSchema(accountsTable);

export type NewAccount = v.InferInput<typeof InsertAccountSchema>;
export type Account = v.InferInput<typeof SelectAccountSchema>;

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
export const SelectVerificationSchema = createSelectSchema(verificationsTable);

export type NewVerification = v.InferInput<typeof InsertVerificationSchema>;
export type Verification = v.InferInput<typeof SelectVerificationSchema>;

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
export type AuthSchemaWithRelations = ExtractTablesWithRelations<AuthSchema>;
