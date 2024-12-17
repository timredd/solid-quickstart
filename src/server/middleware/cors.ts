import { cors as honoCors } from "hono/cors";
import { createMiddleware } from "hono/factory";

import type { Context } from "@/server/router";

export function cors() {
  return createMiddleware<Context>(async (c, next) => {
    const middleware = honoCors({
      origin: c.env.CORS_ORIGIN,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    });

    return middleware(c, next);
  });
}
