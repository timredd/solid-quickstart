import { adapter } from "@/db/adapter";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: adapter,
});

export type Session = typeof auth.$Infer.Session;
