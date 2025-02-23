import { validateSessionToken } from "@/api/auth/session";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { HTTPException } from "hono/http-exception";
import type { Context } from "../router";

const COOKIE_NAME = "auth_session";

export function session() {
  return createMiddleware<Context>(async (c, next) => {
    // Fetch token from cookie
    const token = getCookie(c, COOKIE_NAME);

    // If no token provided, set user and session to null
    if (!token) {
      c.set("session", { user: null, session: null });

      throw new HTTPException(401, {
        cause: "Missing token",
        message: JSON.stringify({ success: false, error: "Invalid session" }),
      });
    }

    // Otherwise, validate the token and set the user and session
    // If token is invalid, user and session will be null
    const { user, session } = await validateSessionToken(token);
    if (!session) {
      deleteCookie(c, COOKIE_NAME, {
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
        maxAge: 0,
        secure: c.env.ENVIRONMENT === "prod" ? true : undefined,
      });
      c.set("session", { user: null, session: null });

      throw new HTTPException(401, {
        cause: "Invalid session",
        message: JSON.stringify({ success: false, error: "Invalid session" }),
      });
    }

    // Create cookie
    setCookie(c, COOKIE_NAME, token, {
      httpOnly: true,
      expires: session.expiresAt,
      sameSite: "Lax",
      path: "/",
      secure: c.env.ENVIRONMENT === "prod" ? true : undefined,
    });

    c.set("session", { user, session });
    await next();
  });
}
