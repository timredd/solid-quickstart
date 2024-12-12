import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";

import type { Session, User } from "@/db/schemas/auth";
import type { Env } from "@/env";

export const app = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>()
  // Enable CORS for auth routes
  .use(
    "/api/auth/**", // replace with "*" to enable CORS for all routes
    cors({
      origin: "http://localhost:3001", // replace with your origin
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  // Inject user and session
  .use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  })
  // Inject auth handler
  .on(["POST", "GET"], "/api/auth/**", (c) => {
    return auth.handler(c.req.raw);
  });
