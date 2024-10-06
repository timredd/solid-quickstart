import * as v from "valibot";

const PublicConfigSchema = v.strictObject({
  /** Port of the app (in dev). */
  VITE_BASE_URL: v.fallback(v.string(), "http://localhost:3000"),
});

export type PublicConfig = v.InferOutput<typeof PublicConfigSchema>;

try {
  v.parse(PublicConfigSchema, import.meta.env);
} catch (e) {
  try {
    console.log(
      "Parsing public config using `import.meta.env` failed, trying `process.env`",
    );
    v.parse(PublicConfigSchema, process.env);
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
