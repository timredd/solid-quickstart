import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export type Nanoid = ReturnType<typeof nanoid>;
