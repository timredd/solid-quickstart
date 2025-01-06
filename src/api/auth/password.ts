import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";

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

/**
 * Verifies the strength of a password.
 * @param password - The password to verify.
 * @returns Whether the password is strong enough.
 */
export async function verifyPasswordStrength(
  password: string,
): Promise<boolean> {
  if (password.length < 8 || password.length > 255) {
    return false;
  }

  const hash = encodeHexLowerCase(sha256(new TextEncoder().encode(password)));
  const prefix = hash.slice(0, 5);

  const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

  const items = await resp.text().then((data) => data.split("\n"));
  for (const item of items) {
    const suffix = item.slice(0, 35).toLowerCase();
    if (hash === prefix + suffix) {
      return false;
    }
  }

  return true;
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
