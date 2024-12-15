import { auth } from "@/lib/auth";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

import {
  createSession,
  generateSessionToken,
  validateSessionToken,
} from "@/api/auth/session";
import { db } from "@/db/client";
import type { Session, User } from "@/db/schemas/auth";
import type { Env } from "@/env";
import { LoginSchema } from "@/shared/types";

export const app = new Hono<{
  Bindings: Env;
  Variables: {
    session: {
      user: User | null;
      session: Session | null;
    };
  };
}>()
  // Enable CORS for auth routes
  .use(
    "/api/auth/**", // replace with "*" to enable CORS for all routes
    cors({
      origin: "http://localhost:3001", // TODO: replace with origin
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  // Enable CSRF protection
  // TODO: can specify origin as string or string array
  // eg. .use(csrf({ origin: ["http://localhost:3001", "http://localhost:3002"] }))
  .use(csrf())
  // Inject user and session
  .use("*", async (c, next) => {
    const token = getCookie(c, "auth_session");

    // If no token provided, set user and session to null
    if (!token) {
      c.set("session", { user: null, session: null });
      return next();
    }

    // Otherwise, validate the token and set the user and session
    // If token is invalid, user and session will be null
    const { user, session } = await validateSessionToken(token);
    c.set("session", { user, session });
    return next();
  })
  // Inject auth handler
  .on(["POST", "GET"], "/api/auth/**", (c) => {
    return auth.handler(c.req.raw);
  })
  // GET /api/login
  .get(
    "/api/login",
    vValidator("json", LoginSchema, async (res, c) => {
      if (!res.success) {
        return c.json({ success: false, error: res.issues });
      }
    }),
    async (c) => {
      const { username, password } = c.req.valid("json");
      const token = generateSessionToken();
      const session = createSession(token, userId);

      if (c.env.ENVIRONMENT === "prod") {
        setCookie(c, "auth_session", token, {});
      }
    },
  );
