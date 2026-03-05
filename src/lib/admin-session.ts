import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";
const TTL_SECONDS = 60 * 60 * 24 * 7;

interface SessionPayload {
  username: string;
  exp: number;
}

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "default-admin-session-secret";
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString();
}

function sign(input: string): string {
  return createHmac("sha256", getSessionSecret()).update(input).digest("base64url");
}

export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (!payload.username || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function attachAdminSessionCookie(response: NextResponse, username: string): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createSessionToken(username),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function getRequestSession(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
