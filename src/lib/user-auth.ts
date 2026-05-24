import "server-only";

import { randomBytes, scryptSync, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { PublicUser, StoredUser } from "@/types/content";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, writeJson } from "@/lib/storage/json-store";
import { USERS_FILE } from "@/lib/data/paths";
import { USER_COOKIE } from "@/lib/user-auth-constants";

const SESSION_DAYS = 14;

function getSecret(): string {
  return process.env.USER_AUTH_SECRET ?? process.env.ADMIN_SECRET ?? "change-this-user-secret";
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function readUsers(): Promise<StoredUser[]> {
  return readJson(STORAGE_KEYS.users, {
    filePath: USERS_FILE,
    fallback: [],
  });
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await writeJson(STORAGE_KEYS.users, users, {
    filePath: USERS_FILE,
  });
}

export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<PublicUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("A user with this email already exists.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const salt = randomBytes(16).toString("hex");
  const user: StoredUser = {
    id: randomBytes(16).toString("hex"),
    name: name.trim(),
    email: normalizedEmail,
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);

  return toPublicUser(user);
}

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<PublicUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  const user = users.find((item) => item.email === normalizedEmail);

  if (!user) return null;

  const expectedHash = hashPassword(password, user.salt);
  const expectedBuffer = Buffer.from(user.passwordHash, "hex");
  const actualBuffer = Buffer.from(expectedHash, "hex");

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  return toPublicUser(user);
}

function isPasswordValid(user: StoredUser, password: string): boolean {
  const expectedHash = hashPassword(password, user.salt);
  const expectedBuffer = Buffer.from(user.passwordHash, "hex");
  const actualBuffer = Buffer.from(expectedHash, "hex");

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export async function updateUserAccount({
  userId,
  name,
  email,
  currentPassword,
  newPassword,
}: {
  userId: string;
  name: string;
  email: string;
  currentPassword: string;
  newPassword?: string;
}): Promise<PublicUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const users = await readUsers();
  const userIndex = users.findIndex((item) => item.id === userId);

  if (userIndex === -1) {
    throw new Error("User account was not found.");
  }

  if (!trimmedName || !normalizedEmail || !currentPassword) {
    throw new Error("Name, email, and current password are required.");
  }

  if (!normalizedEmail.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  if (
    users.some(
      (item) => item.id !== userId && item.email === normalizedEmail
    )
  ) {
    throw new Error("A user with this email already exists.");
  }

  const user = users[userIndex];

  if (!isPasswordValid(user, currentPassword)) {
    throw new Error("Current password is incorrect.");
  }

  user.name = trimmedName;
  user.email = normalizedEmail;

  if (newPassword) {
    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    user.salt = randomBytes(16).toString("hex");
    user.passwordHash = hashPassword(newPassword, user.salt);
  }

  users[userIndex] = user;
  await writeUsers(users);

  return toPublicUser(user);
}

export async function deleteUserAccount({
  userId,
  currentPassword,
}: {
  userId: string;
  currentPassword: string;
}): Promise<void> {
  const users = await readUsers();
  const user = users.find((item) => item.id === userId);

  if (!user) {
    throw new Error("User account was not found.");
  }

  if (!currentPassword || !isPasswordValid(user, currentPassword)) {
    throw new Error("Current password is incorrect.");
  }

  await writeUsers(users.filter((item) => item.id !== userId));
}

export function createUserSessionToken(user: PublicUser): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${user.id}:${user.email}:${exp}`;
  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifyUserSessionToken(token: string | undefined) {
  if (!token) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  try {
    const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
    const [id, email, expStr] = payload.split(":");
    const exp = Number(expStr);

    if (!id || !email || !exp || Number.isNaN(exp) || Date.now() > exp) {
      return null;
    }

    const expected = createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    return { id, email };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const session = verifyUserSessionToken(cookieStore.get(USER_COOKIE)?.value);

  if (!session) return null;

  const users = await readUsers();
  const user = users.find(
    (item) => item.id === session.id && item.email === session.email
  );

  return user ? toPublicUser(user) : null;
}

export function getUserSessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export { USER_COOKIE } from "@/lib/user-auth-constants";
export const USER_SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
