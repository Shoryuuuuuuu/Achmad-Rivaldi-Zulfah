import { getRequestSession } from "@/lib/admin-session";
import { restSelect, restUpdate } from "@/lib/supabase-rest";
import { NextRequest, NextResponse } from "next/server";

interface ProfileBody {
  name?: string;
  role?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  avatar_url?: string;
  cv_url?: string;
  summary?: string[];
  core_focus?: string[];
  hire_modal_title?: string;
  hire_modal_subtitle?: string;
  whatsapp_template?: string;
  email_subject?: string;
  email_template?: string;
}

interface ProfileRow extends ProfileBody {
  id: number;
}

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
}

function sanitizeProfile(body: ProfileBody): Record<string, unknown> {
  return {
    name: (body.name || "").trim(),
    role: (body.role || "").trim(),
    location: (body.location || "").trim(),
    email: (body.email || "").trim(),
    phone: (body.phone || "").trim(),
    linkedin: (body.linkedin || "").trim(),
    avatar_url: (body.avatar_url || "").trim(),
    cv_url: (body.cv_url || "").trim(),
    summary: normalizeArray(body.summary),
    core_focus: normalizeArray(body.core_focus),
    hire_modal_title: (body.hire_modal_title || "").trim(),
    hire_modal_subtitle: (body.hire_modal_subtitle || "").trim(),
    whatsapp_template: (body.whatsapp_template || "").trim(),
    email_subject: (body.email_subject || "").trim(),
    email_template: (body.email_template || "").trim(),
  };
}

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await restSelect<ProfileRow>("site_profile", { limit: "1" });
    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading profile.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ProfileBody;
    const payload = sanitizeProfile(body);

    const rows = await restUpdate<ProfileRow>(
      "site_profile",
      { id: "eq.1" },
      payload
    );

    return NextResponse.json(rows[0] || null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while saving profile.",
      },
      { status: 500 }
    );
  }
}
