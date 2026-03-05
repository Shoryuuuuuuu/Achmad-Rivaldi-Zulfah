import { getRequestSession } from "@/lib/admin-session";
import { getSupabaseBaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase-rest";
import { NextRequest, NextResponse } from "next/server";

const BUCKET_NAME = "profile-assets";

function sanitizeSegment(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = sanitizeSegment(String(formData.get("folder") || "uploads"));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      : "";
    const fileName = `${Date.now()}-${sanitizeSegment(file.name.replace(ext, ""))}${ext}`;
    const objectPath = `${folder}/${fileName}`;
    const encodedPath = objectPath
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");

    const uploadUrl = `${getSupabaseBaseUrl()}/storage/v1/object/${BUCKET_NAME}/${encodedPath}`;
    const serviceKey = getSupabaseServiceRoleKey();

    const bytes = await file.arrayBuffer();
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: Buffer.from(bytes),
    });

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      throw new Error(`Failed to upload file: ${text}`);
    }

    const publicUrl = `${getSupabaseBaseUrl()}/storage/v1/object/public/${BUCKET_NAME}/${encodedPath}`;
    return NextResponse.json({ url: publicUrl, path: objectPath });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while uploading file.",
      },
      { status: 500 }
    );
  }
}
