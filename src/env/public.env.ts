import { parse } from "@/lib/env";
import * as v from "valibot";

const VitePublicSchema = v.pipe(
  v.string(),
  v.startsWith("VITE_", 'Public variables must start with "VITE_"'),
);

const PublicPublicSchema = v.pipe(
  v.string(),
  v.startsWith("PUBLIC_", 'Public variables must start with "PUBLIC_"'),
);

const PublicSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty(),
  v.union([VitePublicSchema, PublicPublicSchema]),
);

type PublicKeySchema = `VITE_${string}` | `PUBLIC_${string}`;

interface PublicObjectEntries {
  [key: PublicKeySchema]: v.GenericSchema;
}

const createPublicEnvSchema = (entries: PublicObjectEntries) => {
  return v.strictObject(entries as v.ObjectEntries);
};

const PublicConfigSchema = createPublicEnvSchema({
  /** Port of the app (in dev). */
  VITE_BASE_URL: v.fallback(v.string(), "http://localhost:3000"),
});

export type PublicConfig = v.InferOutput<typeof PublicConfigSchema>;

try {
  parse(PublicConfigSchema, import.meta.env);
} catch (e) {
  try {
    console.log(
      "Parsing public config using `import.meta.env` failed, trying `process.env`",
    );
    parse(PublicConfigSchema, process.env);
  } catch (e) {
    console.log("Parsing public config using `process.env` failed, exiting...");
    console.error(e);
  }
} finally {
  console.log("Successfully parsed public config");
}

declare global {
  // Make accessible to import.meta.env
  interface ImportMetaEnv extends PublicConfig {}

  // Make accessible to process.env
  namespace NodeJS {
    interface ProcessEnv extends PublicConfig {}
  }
}
