import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as v from "valibot";

/**
 * Combines multiple class names into a single string.
 *
 * @param inputs - The class names to combine.
 * @returns The combined class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a function that parses input based on a given schema and then applies a callback to the parsed result.
 *
 * This function takes a schema and a callback function. It returns a new function that, when called with input,
 * parses the input according to the schema and then applies the callback to the parsed result.
 *
 * @template Schema - The type of the schema used for parsing.
 * @template Callback - The type of the callback function to be applied to the parsed result.
 *
 * @param schema - The schema used to parse the input.
 * @param cb - The callback function to be applied to the parsed result.
 * @returns - A function that takes input, parses it according to the schema, and applies the callback.
 */
export function fn<
  Schema extends v.GenericSchema,
  // biome-ignore lint/suspicious/noExplicitAny: Required
  Callback extends (schema: v.InferOutput<Schema>) => any,
>(schema: Schema, cb: Callback) {
  const result = (input: v.InferInput<typeof schema>): ReturnType<Callback> => {
    const parsed = v.parse(schema, input);
    // biome-ignore lint/suspicious/noExplicitAny: Required
    return cb.apply(cb, [parsed as any]);
  };
  result.schema = schema;
  return result;
}
