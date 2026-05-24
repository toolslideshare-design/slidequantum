import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createUser,
  createUserSessionToken,
  getUserSessionCookieOptions,
  USER_COOKIE,
  USER_SESSION_MAX_AGE,
} from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const user = await createUser({ name, email, password });
    const token = createUserSessionToken(user);
    const cookieStore = await cookies();
    cookieStore.set(
      USER_COOKIE,
      token,
      getUserSessionCookieOptions(USER_SESSION_MAX_AGE)
    );

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create your account.",
      },
      { status: 400 }
    );
  }
}
