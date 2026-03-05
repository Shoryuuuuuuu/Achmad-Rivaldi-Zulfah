import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  }).toString("hex");

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, n, r, p, salt, expected] = stored.split("$");
  if (
    algo !== "scrypt" ||
    !n ||
    !r ||
    !p ||
    !salt ||
    !expected
  ) {
    return false;
  }

  const candidate = scryptSync(password, salt, expected.length / 2, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  const expectedBuffer = Buffer.from(expected, "hex");

  if (candidate.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidate, expectedBuffer);
}
