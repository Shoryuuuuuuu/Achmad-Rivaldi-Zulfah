import { attachAdminSessionCookie, getRequestSession } from "@/lib/admin-session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { restSelect, restUpdate } from "@/lib/supabase-rest";
import { NextRequest, NextResponse } from "next/server";

interface AdminUserRow {
  id: number;
  username: string;
  password_hash: string;
  updated_at: string;
}

interface UpdateSettingsBody {
  currentPassword?: string;
  newUsername?: string;
  newPassword?: string;
}

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await restSelect<AdminUserRow>("admin_users", {
      username: `eq.${session.username}`,
      limit: "1",
    });

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      updated_at: user.updated_at,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading admin settings.",
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
    const body = (await request.json()) as UpdateSettingsBody;
    const currentPassword = body.currentPassword || "";
    const newUsername = (body.newUsername || "").trim();
    const newPassword = body.newPassword || "";

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }

    const rows = await restSelect<AdminUserRow>("admin_users", {
      username: `eq.${session.username}`,
      limit: "1",
    });

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
    }

    if (!verifyPassword(currentPassword, user.password_hash)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const payload: Record<string, unknown> = {};

    if (newUsername) {
      payload.username = newUsername;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }
      payload.password_hash = hashPassword(newPassword);
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { error: "No changes submitted." },
        { status: 400 }
      );
    }

    const updated = await restUpdate<AdminUserRow>(
      "admin_users",
      { id: `eq.${user.id}` },
      payload
    );

    const nextUser = updated[0];
    const response = NextResponse.json({
      success: true,
      username: nextUser.username,
    });

    if (nextUser.username !== session.username) {
      attachAdminSessionCookie(response, nextUser.username);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while updating admin settings.",
      },
      { status: 500 }
    );
  }
}
