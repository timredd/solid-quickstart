import type { Context } from "@/server/router";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export function loggedIn() {
  return createMiddleware<Context>(async (c, next) => {
    const { user } = c.get("session");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    await next();
  });
}
