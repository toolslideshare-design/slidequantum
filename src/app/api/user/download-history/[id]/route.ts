import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { deleteUserDownloadHistoryItem } from "@/lib/data/user-dashboard";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteUserDownloadHistoryItem(user.id, id);

  if (!deleted) {
    return NextResponse.json({ error: "History item not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
