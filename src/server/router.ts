import { cors } from "@/server/middleware/cors";
import { database } from "@/server/middleware/drizzle";
import { session } from "@/server/middleware/session";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { contextStorage } from "hono/context-storage";
import { csrf } from "hono/csrf";

import type { Database } from "@/db/client";
import type { Session, User } from "@/db/schemas/auth";
import type { Transaction } from "@/db/transact";
import type { Env } from "@/env";
import type { Context as HonoContext } from "hono";
import { authRouter } from "./api/auth";

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

const MIN_IN_SEC = 60;

export const app = new Hono<Context>()
  .basePath("/api")
  .use(contextStorage())
  .use("/auth/**", cors())
  .use(csrf())
  // Custom middleware
  .use(database())
  .use(session())
  .get(
    "*",
    cache({
      cacheName: "app-cookie",
      cacheControl: `max-age=${60 * MIN_IN_SEC}`,
    }),
  )
  .route("/auth/**", authRouter);
