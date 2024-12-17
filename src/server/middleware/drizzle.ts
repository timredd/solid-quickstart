import { createDrizzleClient } from "@/db/client";
import { createMiddleware } from "hono/factory";

import type { Context } from "@/server/router";

export function database() {
  return createMiddleware<Context>(async (c, next) => {
    const db = createDrizzleClient({
      url: c.env.DATABASE_URL,
      authToken: c.env.DATABASE_AUTH_TOKEN,
    });
    c.set("db", db);

    await next();
  });
}
