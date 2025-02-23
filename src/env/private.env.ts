import { parse } from "@/lib/env";
import * as v from "valibot";

const PrivateConfigSchema = v.objectWithRest(
  {
    /** Port of the app (in dev). */
    PORT: v.fallback(v.number(), 3000),
    /** Current environment. */
    NODE_ENV: v.fallback(
      v.union([v.literal("development"), v.literal("production")]),
      "development",
    ),
    /** Database API Key. */
    DATABASE_URL: v.string(),
    /** Database Auth Token. */
    DATABASE_AUTH_TOKEN: v.string(),
  },
  v.any(),
);

try {
  parse(PrivateConfigSchema, import.meta.env);
} catch (e) {
  try {
    console.log(
      "Parsing server-only env using `import.meta.env` failed, trying `process.env`",
    );
    parse(PrivateConfigSchema, process.env);
  } catch (e) {
    console.log(
      "Parsing server-only env using `process.env` failed, exiting...",
    );
    console.error(e);
  }
} finally {
  console.log("Successfully parsed server-only env");
}

export type PrivateEnv = v.InferOutput<typeof PrivateConfigSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends PrivateEnv {}
  }

  interface ImportMetaEnv extends PrivateEnv {}
}
