import { getRequestSession } from "@/lib/admin-session";
import { restCount, restSelect } from "@/lib/supabase-rest";
import { NextRequest, NextResponse } from "next/server";

interface PageViewRow {
  id: number;
  path: string;
  viewed_at: string;
}

interface EventRow {
  id: number;
  event_name: string;
  path: string;
  metadata: Record<string, unknown> | null;
  clicked_at: string;
}

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function formatDay(dateString: string): string {
  return new Date(dateString).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const from = isoDaysAgo(30);

    const [totalViews, totalHireClicks, totalContactClicks, recentViews, recentEvents] =
      await Promise.all([
        restCount("page_views"),
        restCount("event_clicks", { event_name: "eq.hire_me_click" }),
        restCount("event_clicks", { event_name: "eq.contact_click" }),
        restSelect<PageViewRow>("page_views", {
          viewed_at: `gte.${from}`,
          order: "viewed_at.asc",
        }),
        restSelect<EventRow>("event_clicks", {
          clicked_at: `gte.${from}`,
          order: "clicked_at.asc",
        }),
      ]);

    const viewsByDay = new Map<string, number>();
    for (const view of recentViews) {
      const day = formatDay(view.viewed_at);
      viewsByDay.set(day, (viewsByDay.get(day) || 0) + 1);
    }

    const projectClicks = new Map<string, number>();
    for (const event of recentEvents) {
      if (event.event_name !== "portfolio_view_click") continue;
      const projectId =
        typeof event.metadata?.projectId === "string"
          ? event.metadata.projectId
          : "unknown";
      projectClicks.set(projectId, (projectClicks.get(projectId) || 0) + 1);
    }

    const topProjects = Array.from(projectClicks.entries())
      .map(([projectId, clicks]) => ({ projectId, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    const trend = Array.from(viewsByDay.entries()).map(([date, views]) => ({
      date,
      views,
    }));

    return NextResponse.json({
      totals: {
        pageViews: totalViews,
        hireClicks: totalHireClicks,
        contactClicks: totalContactClicks,
      },
      trend,
      topProjects,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading analytics.",
      },
      { status: 500 }
    );
  }
}
