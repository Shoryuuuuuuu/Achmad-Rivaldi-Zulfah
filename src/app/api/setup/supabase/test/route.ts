import { NextResponse } from "next/server";

interface TestBody {
  supabaseUrl?: string;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestBody;
    const supabaseUrl = sanitize(body.supabaseUrl);
    const supabaseServiceRoleKey = sanitize(body.supabaseServiceRoleKey);

    if (!isValidSupabaseUrl(supabaseUrl)) {
      return NextResponse.json(
        { connected: false, schemaReady: false, message: "URL Supabase lu gak valid." },
        { status: 400 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { connected: false, schemaReady: false, message: "Service role key wajib diisi." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/site_profile?select=id&limit=1`,
        {
          method: "GET",
          headers: {
            apikey: supabaseServiceRoleKey,
            Authorization: `Bearer ${supabaseServiceRoleKey}`,
          },
          cache: "no-store",
          signal: controller.signal,
        }
      );

      const text = await response.text();

      if (response.ok) {
        return NextResponse.json({
          connected: true,
          schemaReady: true,
          message: "Koneksi aman. Schema keliatan udah siap.",
        });
      }

      const lower = text.toLowerCase();
      if (
        response.status === 404 &&
        (lower.includes("site_profile") || lower.includes("relation"))
      ) {
        return NextResponse.json({
          connected: true,
          schemaReady: false,
          message:
            "Konek ke Supabase, tapi schema belom ada. Jalanin dulu supabase/schema.sql.",
        });
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          connected: false,
          schemaReady: false,
          message: "Koneksi gagal. Cek lagi service role key lu.",
        });
      }

      return NextResponse.json({
        connected: false,
        schemaReady: false,
        message: `Koneksi gagal (${response.status}).`,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ada error pas ngetes koneksi.";
    return NextResponse.json(
      { connected: false, schemaReady: false, message },
      { status: 500 }
    );
  }
}
