import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import {
  addUserSavedPresentation,
  getUserSavedPresentations,
} from "@/lib/data/user-dashboard";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const savedPresentations = await getUserSavedPresentations(user.id);
  return NextResponse.json({ savedPresentations });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please log in to save presentations." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      slideshareUrl?: string;
      thumbnailUrl?: string;
    };

    if (!body.title || !body.slideshareUrl || !body.thumbnailUrl) {
      return NextResponse.json(
        { error: "Title, URL, and thumbnail are required." },
        { status: 400 }
      );
    }

    const item = await addUserSavedPresentation(user.id, {
      title: body.title.trim(),
      slideshareUrl: body.slideshareUrl.trim(),
      thumbnailUrl: body.thumbnailUrl,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save this presentation." },
      { status: 400 }
    );
  }
}
