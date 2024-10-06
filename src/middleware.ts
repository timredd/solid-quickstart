import { createDrizzleClient } from "@/db/client";
import { createMiddleware } from "@solidjs/start/middleware";

export default createMiddleware({
  onRequest: async (event) => {
    // Inject the database client into the request context
    event.locals.db = createDrizzleClient();
  },
});

declare module "@solidjs/start/server" {
  interface RequestEventLocals {
    db: ReturnType<typeof createDrizzleClient>;
  }
}
