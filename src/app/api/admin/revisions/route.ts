import { getRequestSession } from "@/lib/admin-session";
import { getRevisionBundle } from "@/lib/content-revisions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bundle = await getRevisionBundle();
    return NextResponse.json(bundle);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading revisions.",
      },
      { status: 500 }
    );
  }
}
