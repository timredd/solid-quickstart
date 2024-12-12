import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import type { Env } from "@/server/router";

export const loggedIn = createMiddleware<Env>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return await next();
});
