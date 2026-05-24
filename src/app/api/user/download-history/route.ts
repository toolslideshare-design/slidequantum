import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import {
  addUserDownloadHistory,
  getUserDownloadHistory,
} from "@/lib/data/user-dashboard";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await getUserDownloadHistory(user.id);
  return NextResponse.json({ history });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      slideshareUrl?: string;
      format?: "PDF" | "PPT";
      downloadUrl?: string;
    };

    if (!body.title || !body.slideshareUrl || !body.format) {
      return NextResponse.json(
        { error: "Title, URL, and format are required." },
        { status: 400 }
      );
    }

    const item = await addUserDownloadHistory(user.id, {
      title: body.title.trim(),
      slideshareUrl: body.slideshareUrl.trim(),
      format: body.format,
      downloadUrl: body.downloadUrl,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save download history." },
      { status: 400 }
    );
  }
}
