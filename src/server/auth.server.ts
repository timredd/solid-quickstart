import { createMiddleware } from "@solidjs/start/middleware";
import type { FetchEvent } from "@solidjs/start/server";
import { useSession } from "vinxi/http";
import { validateSessionToken } from "./auth";

export default createMiddleware({
  // Auth middleware
  onRequest: [authMiddleware],
});

function getSession() {
  return useSession({
    password: process.env.SESSION_SECRET!,
  });
}

async function authMiddleware({ request, response }: FetchEvent) {
  // CSRF protection
  if (request.method !== "GET") {
    const origin = request.headers.get("Origin");
    // You can also compare it against the Host or X-Forwarded-Host header.
    if (origin === null || origin !== import.meta.env.BASE_URL) {
      response.status = 403;
      return;
    }
  }

  const existingSession = await getSession();
  const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");
  const token = cookies.get("session");
  if (!existingSession?.id) {
    response.status = 401;
    return;
  }

  const { session } = await validateSessionToken(token);
  if (!session) {
    deleteSessionCookie(response);
    response.status = 401;
    return;
  }

  setSessionCookie(response, token, session.expiresAt);
}

export function setSessionCookie(
  response: FetchEvent["response"],
  token: string,
  expiresAt: Date,
): void {
  if (import.meta.env.PROD) {
    response.headers.set(
      "Set-Cookie",
      `session=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/; Secure;`,
    );
  } else {
    response.headers.set(
      "Set-Cookie",
      `session=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/`,
    );
  }
}

export function deleteSessionCookie(response: FetchEvent["response"]): void {
  if (import.meta.env.PROD) {
    response.headers.set(
      "Set-Cookie",
      "session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure;",
    );
  } else {
    response.headers.set(
      "Set-Cookie",
      "session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/",
    );
  }
}
