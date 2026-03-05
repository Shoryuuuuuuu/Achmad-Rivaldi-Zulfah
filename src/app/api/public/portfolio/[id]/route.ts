import { getPortfolioItemById } from "@/lib/site-content";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const item = await getPortfolioItemById(params.id);

  if (!item) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(item);
}
