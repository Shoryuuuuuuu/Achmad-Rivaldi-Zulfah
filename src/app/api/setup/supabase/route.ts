import { getRequestSession } from "@/lib/admin-session";
import {
  getEffectiveSupabaseConfig,
  getRuntimeSupabaseConfig,
  saveRuntimeSupabaseConfig,
} from "@/lib/runtime-config";
import { NextRequest, NextResponse } from "next/server";

interface SetupBody {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
}

function sanitize(value: string | undefined): string {
  return (value || "").trim();
}

function isValidSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function canWriteConfig(request: NextRequest): boolean {
  const { source } = getEffectiveSupabaseConfig();
  if (source === "none") return true;
  return Boolean(getRequestSession(request));
}

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  const { source, config } = getEffectiveSupabaseConfig();
  const runtime = getRuntimeSupabaseConfig();

  if (session) {
    return NextResponse.json({
      source,
      configured: source !== "none",
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      supabaseServiceRoleKey: config.supabaseServiceRoleKey,
      hasRuntimeConfig: Boolean(runtime.supabaseUrl && runtime.supabaseServiceRoleKey),
    });
  }

  return NextResponse.json({
    source,
    configured: source !== "none",
    supabaseUrl: config.supabaseUrl,
    hasSupabaseAnonKey: Boolean(config.supabaseAnonKey),
    hasSupabaseServiceRoleKey: Boolean(config.supabaseServiceRoleKey),
    hasRuntimeConfig: Boolean(runtime.supabaseUrl && runtime.supabaseServiceRoleKey),
  });
}

export async function PUT(request: NextRequest) {
  if (!canWriteConfig(request)) {
    return NextResponse.json({ error: "Akses ditolak, bro." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SetupBody;
    const supabaseUrl = sanitize(body.supabaseUrl);
    const supabaseAnonKey = sanitize(body.supabaseAnonKey);
    const supabaseServiceRoleKey = sanitize(body.supabaseServiceRoleKey);

    if (!isValidSupabaseUrl(supabaseUrl)) {
      return NextResponse.json(
        { error: "URL Supabase lu gak valid. Formatnya harus https://<project>.supabase.co" },
        { status: 400 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Service role key wajib diisi, bro." },
        { status: 400 }
      );
    }

    saveRuntimeSupabaseConfig({
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceRoleKey,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ada error pas nyimpen config Supabase.",
      },
      { status: 500 }
    );
  }
}
