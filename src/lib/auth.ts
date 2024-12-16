import { adapter } from "@/db/adapter";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: adapter,
});

export type Session = typeof auth.$Infer.Session;

/**
 * Hashes a string using PBKDF2 with 100,000 iterations and SHA-256.
 *
 * @param password - The password to hash.
 * @param salt - The salt to use for hashing.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(
  password: string,
  salt: Uint8Array = crypto.getRandomValues(new Uint8Array(16)),
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: 100000 },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const hashHex = Hex.to(new Uint8Array(exportedKey));
  const saltHex = Hex.to(salt);

  return [saltHex, hashHex].join(":");
}

/**
 * Verifies a `passwordAttempt` against a `storedHash`.
 *
 * @param storedHash - The stored hash to compare against.
 * @param passwordAttempt - The password attempt to verify.
 * @returns Whether the `passwordAttempt` matches the `storedHash`.
 */
export async function verifyPassword(
  storedHash: string,
  passwordAttempt: string,
): Promise<boolean> {
  const [saltHex, originalHash] = storedHash.split(":");

  const matchResult = saltHex.match(/.{1,2}/g);
  if (!matchResult) {
    throw new Error("Invalid salt format");
  }

  const salt = new Uint8Array(matchResult.map(Hex.from));
  try {
    const attemptHashWithSalt = await hashPassword(passwordAttempt, salt);
    const [, attemptHash] = attemptHashWithSalt.split(":");

    return attemptHash === originalHash;
  } catch (e) {
    throw new Error("Failed to hash password attempt");
  }
}

const Hex = {
  from(byte: string) {
    return Number.parseInt(byte, 16);
  },

  to(input: number | Uint8Array): string {
    const toHexByte = (byte: number) => byte.toString(16).padStart(2, "0");

    return typeof input !== "number"
      ? Array.from(input).map(toHexByte).join("")
      : toHexByte(input);
  },
};
