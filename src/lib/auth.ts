import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { ADMIN_COOKIE } from "@/lib/auth-constants";

const SESSION_DAYS = 7;

function getSecret(): string {
  return process.env.ADMIN_SECRET ?? "change-this-secret-in-production";
}

function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "waliullahshah18",
    password: process.env.ADMIN_PASSWORD ?? "wali12345$",
  };
}

export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  const creds = getAdminCredentials();
  return username === creds.username && password === creds.password;
}

export function createSessionToken(username: string): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${username}:${exp}`;
  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  try {
    const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
    const [username, expStr] = payload.split(":");
    const exp = Number(expStr);

    if (!username || !exp || Number.isNaN(exp) || Date.now() > exp) {
      return false;
    }

    const expected = createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (sigBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export function getSessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export { ADMIN_COOKIE } from "@/lib/auth-constants";
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
