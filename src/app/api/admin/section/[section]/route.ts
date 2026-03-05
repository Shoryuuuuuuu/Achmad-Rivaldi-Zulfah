import { getRequestSession } from "@/lib/admin-session";
import { restDelete, restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";
import { NextRequest, NextResponse } from "next/server";

type SectionName =
  | "experiences"
  | "education"
  | "organizations"
  | "skills"
  | "portfolio_projects";

type JsonObject = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function sanitizeTechStack(value: unknown): Array<{ name: string; icon: string }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as JsonObject;
      const name = asString(record.name);
      const icon = asString(record.icon);
      if (!name || !icon) return null;
      return { name, icon };
    })
    .filter((item): item is { name: string; icon: string } => item !== null);
}

function sanitizeSection(section: SectionName, input: JsonObject): JsonObject {
  switch (section) {
    case "experiences":
      return {
        role: asString(input.role),
        company: asString(input.company),
        period: asString(input.period),
        location: asString(input.location),
        description: asStringArray(input.description),
        sort_order: asNumber(input.sort_order, 0),
      };

    case "education":
      return {
        institution: asString(input.institution),
        degree: asString(input.degree),
        period: asString(input.period),
        description: asString(input.description),
        achievements: asStringArray(input.achievements),
        sort_order: asNumber(input.sort_order, 0),
      };

    case "organizations":
      return {
        role: asString(input.role),
        organization: asString(input.organization),
        period: asString(input.period),
        description: asStringArray(input.description),
        sort_order: asNumber(input.sort_order, 0),
      };

    case "skills":
      return {
        category: asString(input.category),
        name: asString(input.name),
        icon: asString(input.icon),
        sort_order: asNumber(input.sort_order, 0),
      };

    case "portfolio_projects":
      return {
        id: asString(input.id),
        title: asString(input.title),
        description: asString(input.description),
        long_description: asString(input.long_description),
        challenge: asString(input.challenge),
        solution: asString(input.solution),
        features: asStringArray(input.features),
        tech_stack_details: sanitizeTechStack(input.tech_stack_details),
        gallery: asStringArray(input.gallery),
        tags: asStringArray(input.tags),
        image: asString(input.image),
        type: asString(input.type) || "web",
        status: asString(input.status) || "published",
        url: asString(input.url) || null,
        pdf_url: asString(input.pdf_url) || null,
        video_url: asString(input.video_url) || null,
        role: asString(input.role) || null,
        timeline: asString(input.timeline) || null,
        maintenance_title: asString(input.maintenance_title) || null,
        maintenance_icon: asString(input.maintenance_icon) || null,
        maintenance_header: asString(input.maintenance_header) || null,
        maintenance_body: asString(input.maintenance_body) || null,
        sort_order: asNumber(input.sort_order, 0),
      };

    default:
      return {};
  }
}

function parseSection(value: string): SectionName | null {
  if (
    value === "experiences" ||
    value === "education" ||
    value === "organizations" ||
    value === "skills" ||
    value === "portfolio_projects"
  ) {
    return value;
  }
  return null;
}

function getOrder(section: SectionName): string {
  if (section === "portfolio_projects") {
    return "sort_order.asc,id.asc";
  }
  return "sort_order.asc,id.asc";
}

function getIdFilter(section: SectionName, body: JsonObject): Record<string, string> {
  if (section === "portfolio_projects") {
    return { id: `eq.${asString(body.id)}` };
  }
  const id = asNumber(body.id);
  return { id: `eq.${id}` };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const section = parseSection(params.section);
  if (!section) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  try {
    const rows = await restSelect<JsonObject>(section, { order: getOrder(section) });
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading section.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const section = parseSection(params.section);
  if (!section) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as JsonObject;
    const payload = sanitizeSection(section, body);

    if (section === "portfolio_projects" && !asString(payload.id)) {
      return NextResponse.json(
        { error: "Portfolio project ID is required." },
        { status: 400 }
      );
    }

    const rows = await restInsert<JsonObject>(section, payload);
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while creating item.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const section = parseSection(params.section);
  if (!section) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as JsonObject;
    const payload = sanitizeSection(section, body);

    if (section !== "portfolio_projects") {
      delete payload.id;
    }

    const rows = await restUpdate<JsonObject>(
      section,
      getIdFilter(section, body),
      payload
    );

    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while updating item.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const section = parseSection(params.section);
  if (!section) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as JsonObject;
    await restDelete(section, getIdFilter(section, body));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while deleting item.",
      },
      { status: 500 }
    );
  }
}
