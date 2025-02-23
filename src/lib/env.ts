import * as v from "valibot";

interface ParseOptions {
  strict?: boolean;
}

/**
 * Parses environment variables and validates them against a schema.
 *
 * If the `strict` option is set to `true`, the function will throw an error
 * if the validation fails. Otherwise, it will log a warning and continue.
 *
 * @param schema Schema to validate against.
 * @param env Object containing environment variables.
 * @param options Options for parsing.
 */
export function parse<TSchema extends v.GenericSchema>(
  schema: TSchema,
  env: ImportMetaEnv | NodeJS.ProcessEnv,
  options?: ParseOptions,
) {
  const opts = {
    strict: true,
    ...options,
  } satisfies ParseOptions;

  try {
    const config = v.parse(schema, env);
    return config;
  } catch (err) {
    const msg = `Failed to parse environment variables:\n  ${formatErrors(err)}`;
    if (opts.strict) {
      throw new Error(msg);
    }
    console.warn(msg);
  }
}

/**
 * Utility function to format errors from environment validation.
 *
 * @template T - Schema to validate against.
 * @param err - Error from environment validation.
 * @returns - Formatted error message.
 */
function formatErrors<TSchema extends v.GenericSchema>(err: unknown) {
  // Handle valibot errors
  if (v.isValiError<TSchema>(err)) {
    const flatErrors = v.flatten<TSchema>(err.issues);
    return JSON.stringify(flatErrors, null, 2);
  }

  // Handle unknown types
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") return JSON.stringify(err, null, 2);
  if (Array.isArray(err)) return err.join(", ");
  if (typeof err === "undefined") return "Unknown error";
  return "Unknown error";
}
