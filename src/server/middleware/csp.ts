import { randomBytes } from "node:crypto";
import { createMiddleware } from "@solidjs/start/middleware";

export default createMiddleware({
  onRequest: (event) => {
    const nonce = randomBytes(16).toString("base64");

    event.locals.nonce = nonce;

    const csp = `
      default-src 'self';
      script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
      object-src 'none';
      base-uri 'none';
      frame-ancestors 'none';
      form-action 'self';
    `.replace(/\s+/g, " ");

    event.response.headers.set("Content-Security-Policy", csp);
  },
});
