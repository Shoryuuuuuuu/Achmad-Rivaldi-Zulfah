import { getRequestSession } from "@/lib/admin-session";
import { getSupabaseBaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase-rest";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "profile-assets";
const DEFAULT_PREFIXES = ["avatars", "cv", "portfolio", "uploads"];

interface StorageListRow {
  name: string;
  id: string | null;
  updated_at: string;
  created_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

interface MediaItem {
  path: string;
  name: string;
  folder: string;
  updatedAt: string;
  size: number;
  mimeType: string;
  url: string;
}

async function listPrefix(prefix: string): Promise<MediaItem[]> {
  const response = await fetch(
    `${getSupabaseBaseUrl()}/storage/v1/object/list/${BUCKET}`,
    {
      method: "POST",
      headers: {
        apikey: getSupabaseServiceRoleKey(),
        Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix,
        limit: 200,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to list media for ${prefix}: ${text}`);
  }

  const rows = (await response.json()) as StorageListRow[];

  return rows
    .filter((row) => Boolean(row.id))
    .map((row) => {
      const objectPath = `${prefix}/${row.name}`;
      const encodedPath = objectPath
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");

      return {
        path: objectPath,
        name: row.name,
        folder: prefix,
        updatedAt: row.updated_at,
        size: row.metadata?.size || 0,
        mimeType: row.metadata?.mimetype || "application/octet-stream",
        url: `${getSupabaseBaseUrl()}/storage/v1/object/public/${BUCKET}/${encodedPath}`,
      };
    });
}

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const queryFolder = request.nextUrl.searchParams.get("folder");
    const prefixes = queryFolder ? [queryFolder] : DEFAULT_PREFIXES;

    const result = await Promise.all(prefixes.map((prefix) => listPrefix(prefix)));
    const items = result
      .flat()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading media library.",
      },
      { status: 500 }
    );
  }
}
