import { app } from "@/server/router";
import type { APIEvent } from "@solidjs/start/server";

const handler = (event: APIEvent) => {
  const { request, env, context } = event.nativeEvent.context.cloudflare;
  return app.fetch(request, env, context);
};

export const GET = handler;

export const POST = handler;
