import { clearAdminSessionCookie, getRequestSession } from "@/lib/admin-session";
import { emptyContent } from "@/lib/content-types";
import { clearRuntimeSupabaseConfig } from "@/lib/runtime-config";
import { restDelete, restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";
import { NextRequest, NextResponse } from "next/server";

interface ProfileRow {
  id: number;
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak, bro." }, { status: 401 });
  }

  try {
    await Promise.all([
      restDelete("experiences", { id: "not.is.null" }),
      restDelete("education", { id: "not.is.null" }),
      restDelete("organizations", { id: "not.is.null" }),
      restDelete("skills", { id: "not.is.null" }),
      restDelete("portfolio_projects", { id: "not.is.null" }),
      restDelete("content_revisions", { id: "not.is.null" }),
      restDelete("page_views", { id: "not.is.null" }),
      restDelete("event_clicks", { id: "not.is.null" }),
    ]);

    const profilePayload = {
      id: 1,
      name: "",
      role: "",
      location: "",
      email: "",
      phone: "",
      linkedin: "",
      avatar_url: "",
      cv_url: "",
      summary: [],
      core_focus: [],
      hire_modal_title: "Yuk Kerja Bareng",
      hire_modal_subtitle: "Pilih cara kontak yang paling nyaman.",
      whatsapp_template: "Halo, gue mau ngobrol soal peluang kerja sama.",
      email_subject: "Ngobrolin Peluang Kerja Sama",
      email_template: "Halo, gue mau ngobrol soal peluang kerja sama.",
    };

    const profiles = await restSelect<ProfileRow>("site_profile", { id: "eq.1", limit: "1" });
    if (profiles.length > 0) {
      await restUpdate("site_profile", { id: "eq.1" }, profilePayload);
    } else {
      await restInsert("site_profile", profilePayload);
    }

    await restInsert("content_revisions", [
      {
        status: "published",
        snapshot: emptyContent,
        note: "Reset pabrik konten live",
      },
      {
        status: "draft",
        snapshot: emptyContent,
        note: "Reset pabrik konten draft",
      },
    ]);

    await restDelete("admin_users", { id: "not.is.null" });
    clearRuntimeSupabaseConfig();

    const response = NextResponse.json({
      success: true,
      resetConfig: true,
    });
    clearAdminSessionCookie(response);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ada error pas reset pabrik.",
      },
      { status: 500 }
    );
  }
}
