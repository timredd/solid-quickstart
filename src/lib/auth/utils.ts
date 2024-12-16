/**
 * Extracts the bearer token from a request's Authorization header.
 */
export function getBearerToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return null;
  }
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") {
    return null;
  }
  return token;
}

/**
 * Creates an instance of Password.
 * Source: https://lord.technology/2024/02/21/hashing-passwords-on-cloudflare-workers.html
 */
