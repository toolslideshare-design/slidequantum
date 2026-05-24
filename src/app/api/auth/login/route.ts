import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createUserSessionToken,
  getUserSessionCookieOptions,
  USER_COOKIE,
  USER_SESSION_MAX_AGE,
  verifyUserCredentials,
} from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const user = await verifyUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createUserSessionToken(user);
    const cookieStore = await cookies();
    cookieStore.set(
      USER_COOKIE,
      token,
      getUserSessionCookieOptions(USER_SESSION_MAX_AGE)
    );

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
