import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createUserSessionToken,
  deleteUserAccount,
  getCurrentUser,
  getUserSessionCookieOptions,
  updateUserAccount,
  USER_COOKIE,
  USER_SESSION_MAX_AGE,
} from "@/lib/user-auth";
import { deleteAllUserDashboardData } from "@/lib/data/user-dashboard";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const updatedUser = await updateUserAccount({
      userId: user.id,
      name: body.name ?? "",
      email: body.email ?? "",
      currentPassword: body.currentPassword ?? "",
      newPassword: body.newPassword?.trim() || undefined,
    });
    const token = createUserSessionToken(updatedUser);
    const cookieStore = await cookies();

    cookieStore.set(
      USER_COOKIE,
      token,
      getUserSessionCookieOptions(USER_SESSION_MAX_AGE)
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update account settings.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { currentPassword?: string };

    await deleteUserAccount({
      userId: user.id,
      currentPassword: body.currentPassword ?? "",
    });
    await deleteAllUserDashboardData(user.id);

    const cookieStore = await cookies();
    cookieStore.set(USER_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete account.",
      },
      { status: 400 }
    );
  }
}
