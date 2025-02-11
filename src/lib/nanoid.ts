import { customAlphabet } from "nanoid";

const DEFAULT_SIZE = 21;
const DEFAULT_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";
export const nanoid = customAlphabet(DEFAULT_ALPHABET, DEFAULT_SIZE);

const LONG_SIZE = 30;
const LONG_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";
export const nanoidLong = customAlphabet(LONG_ALPHABET, LONG_SIZE);

const TOKEN_SIZE = 32;
const TOKEN_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const nanoidToken = customAlphabet(TOKEN_ALPHABET, TOKEN_SIZE);

export type Nanoid = ReturnType<typeof nanoid>;
