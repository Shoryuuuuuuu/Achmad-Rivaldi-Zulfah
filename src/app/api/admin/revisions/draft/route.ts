import { getRequestSession } from "@/lib/admin-session";
import { saveDraftSnapshot } from "@/lib/content-revisions";
import { NextRequest, NextResponse } from "next/server";

interface DraftBody {
  snapshot?: unknown;
}

export async function PUT(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as DraftBody;
    const snapshot = await saveDraftSnapshot(body.snapshot || {});
    return NextResponse.json({ snapshot });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while saving draft.",
      },
      { status: 500 }
    );
  }
}
