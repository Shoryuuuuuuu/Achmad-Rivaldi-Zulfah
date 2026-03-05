import { getRequestSession } from "@/lib/admin-session";
import { publishDraft } from "@/lib/content-revisions";
import { NextRequest, NextResponse } from "next/server";

interface PublishBody {
  note?: string;
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as PublishBody;
    const revision = await publishDraft(body.note);
    return NextResponse.json({ success: true, revision });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while publishing draft.",
      },
      { status: 500 }
    );
  }
}
