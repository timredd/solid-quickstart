import { customAlphabet } from "nanoid";

import * as v from "valibot";

export const DEFAULT_SIZE = 21;
export const DEFAULT_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";
export const nanoid = customAlphabet(DEFAULT_ALPHABET, DEFAULT_SIZE);

export const LONG_SIZE = 30;
export const LONG_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";
export const nanoidLong = customAlphabet(LONG_ALPHABET, LONG_SIZE);

export const TOKEN_SIZE = 32;
export const TOKEN_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const nanoidToken = customAlphabet(TOKEN_ALPHABET, TOKEN_SIZE);

export type Nanoid = ReturnType<typeof nanoid>;

export const NanoIdSchema = v.pipe(
  v.string(),
  v.nanoid(),
  v.length(DEFAULT_SIZE),
);

export type NanoId = v.InferOutput<typeof NanoIdSchema>;
