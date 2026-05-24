import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { deleteUserSavedPresentation } from "@/lib/data/user-dashboard";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteUserSavedPresentation(user.id, id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Saved presentation not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
