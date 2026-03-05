import { getRequestSession } from "@/lib/admin-session";
import { getSiteContent } from "@/lib/site-content";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading content.",
      },
      { status: 500 }
    );
  }
}
