import { restInsert } from "@/lib/supabase-rest";
import { NextRequest, NextResponse } from "next/server";

interface TrackBody {
  type?: "page_view" | "event";
  path?: string;
  eventName?: string;
  metadata?: Record<string, unknown>;
}

function getHeader(request: NextRequest, key: string): string {
  return request.headers.get(key) || "";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackBody;
    const path = (body.path || "/").slice(0, 255);

    if (body.type === "page_view") {
      await restInsert("page_views", {
        path,
        referrer: getHeader(request, "referer").slice(0, 500),
        user_agent: getHeader(request, "user-agent").slice(0, 500),
      });
      return NextResponse.json({ success: true });
    }

    if (body.type === "event") {
      const eventName = (body.eventName || "unknown_event").slice(0, 120);
      await restInsert("event_clicks", {
        event_name: eventName,
        path,
        metadata: body.metadata || {},
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid tracking payload." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected tracking error.",
      },
      { status: 500 }
    );
  }
}
