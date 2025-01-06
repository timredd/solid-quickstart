import { cors } from "@/server/middleware/cors";
import { database } from "@/server/middleware/drizzle";
import { session } from "@/server/middleware/session";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { contextStorage } from "hono/context-storage";
import { csrf } from "hono/csrf";
import { authRouter } from "./api/auth";
import { openApi, scalar } from "./middleware/openapi";

import type { Database } from "@/db/client";
import type { Session, User } from "@/db/schema/auth";
import type { Transaction } from "@/db/transact";
import type { Env } from "@/env";
import type { Context as HonoContext } from "hono";

export interface Context extends HonoContext {
  Bindings: Env;
  Variables: {
    db: Database;
    session: {
      user: User | null;
      session: Session | null;
    };
    transact: {
      tx: Transaction;
      effects: Array<() => void>;
    };
  };
}

const app = new Hono<Context>()
  .basePath("/api")
  .use(contextStorage())
  .use(csrf())
  .use("/auth/**", cors())
  // Custom middleware
  .use(database())
  .use(session())
  // Cache controls
  .get(
    "*",
    cache({
      cacheName: "app-cookie",
      cacheControl: `max-age=${60 * 60}`,
    }),
  )
  .route("/auth/**", authRouter);

// Needs to be separate to avoid circular type
app
  // OpenAPI specification
  .get("/openapi", openApi)
  // OpenAPI UI
  .get("/docs", scalar);

export { app };
