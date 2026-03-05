import { attachAdminSessionCookie } from "@/lib/admin-session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { restInsert, restSelect } from "@/lib/supabase-rest";
import { NextResponse } from "next/server";

interface AdminUserRow {
  username: string;
  password_hash: string;
}

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const username = (body.username || "").trim();
    const password = body.password || "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username sama password wajib diisi." },
        { status: 400 }
      );
    }

    const users = await restSelect<AdminUserRow>("admin_users", {
      username: `eq.${username}`,
      limit: "1",
    });

    let user = users[0];

    if (!user) {
      const seedUsername = (process.env.ADMIN_USERNAME || "admin").trim();
      const seedPassword = process.env.ADMIN_PASSWORD || "admin";

      if (seedUsername && seedPassword && seedUsername === username) {
        const existingUsers = await restSelect<AdminUserRow>("admin_users", {
          limit: "1",
        });

        if (existingUsers.length === 0 && seedPassword === password) {
          const createdUsers = await restInsert<AdminUserRow>("admin_users", {
            username: seedUsername,
            password_hash: hashPassword(seedPassword),
          });
          user = createdUsers[0];
        }
      }
    }

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, username: user.username });
    attachAdminSessionCookie(response, user.username);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ada error pas login.",
      },
      { status: 500 }
    );
  }
}
