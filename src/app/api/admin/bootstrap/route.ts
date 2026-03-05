import { getRequestSession } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak, bro." }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Endpoint bootstrap lama udah dihapus. Setting profil langsung dari dashboard admin aja.",
    },
    { status: 410 }
  );
}
