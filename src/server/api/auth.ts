import { getUserAccount } from "@/api/auth/account";
import { createSession, generateSessionToken } from "@/api/auth/session";
import { getUserByEmail } from "@/api/auth/user";
import { InsertAccountSchema, InsertUserSchema } from "@/db/schema/auth";
import { verifyPassword } from "@/lib/auth";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";

import * as v from "valibot";

import type { Context } from "@/server/router";
import type { SuccessResponse } from "@/shared/types";
import { HTTPException } from "hono/http-exception";

export const authRouter = new Hono<Context>().get(
  "/login",
  vValidator(
    "json",
    v.object({
      email: InsertUserSchema.entries.email,
      password: InsertAccountSchema.entries.passwordHash,
    }),
    async (res, c) => {
      if (!res.success) {
        return c.json({ success: false, error: res.issues });
      }
    },
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const user = await getUserByEmail(email, { account: true });
    if (!user) {
      throw new HTTPException(401, {
        message: "Invalid username or password",
        cause: "Missing user",
      });
    }
    const account = await getUserAccount(user.id);
    if (!account) {
      throw new HTTPException(401, {
        message: "Invalid username or password",
        cause: "Missing account",
      });
    }

    const { passwordHash } = account;
    if (!passwordHash) {
      throw new HTTPException(401, {
        message: "Invalid username or password",
        cause: "Missing password",
      });
    }

    // Verify the password
    const isValid = await verifyPassword(passwordHash, password);
    if (!isValid) {
      throw new HTTPException(401, {
        message: "Invalid username or password",
        cause: "Invalid password",
      });
    }

    // If the user is valid, create a new session
    const token = generateSessionToken();
    const session = await createSession(token, user.id);

    return c.json<SuccessResponse<{ sessionId: string }>>({
      success: true,
      message: "Logged in",
      data: {
        sessionId: session.id,
      },
    });
  },
);
