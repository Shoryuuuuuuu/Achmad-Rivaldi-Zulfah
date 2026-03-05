import { getRequestSession } from "@/lib/admin-session";
import { restoreDraftFromRevision } from "@/lib/content-revisions";
import { NextRequest, NextResponse } from "next/server";

interface RestoreBody {
  revisionId?: number;
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as RestoreBody;
    const revisionId = Number(body.revisionId || 0);

    if (!revisionId) {
      return NextResponse.json(
        { error: "Revision ID is required." },
        { status: 400 }
      );
    }

    const snapshot = await restoreDraftFromRevision(revisionId);
    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while restoring draft.",
      },
      { status: 500 }
    );
  }
}
