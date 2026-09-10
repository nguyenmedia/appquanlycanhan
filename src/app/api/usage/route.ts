import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserUsage } from "@/lib/usage";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const usage = await getUserUsage(user.id);
    return NextResponse.json({ success: true, ...usage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
