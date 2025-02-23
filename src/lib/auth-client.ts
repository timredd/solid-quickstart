import { createAuthClient } from "better-auth/solid";

export const {
  useSession,
  $ERROR_CODES: AUTH_ERRORS,
  $Infer,
  $fetch: betterFetch,
  ...authClient
} = createAuthClient();
