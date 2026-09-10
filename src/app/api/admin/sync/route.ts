import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { uploadAllToSupabase, getSyncStats } from "@/lib/sync/supabase-sync";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
    const stats = await getSyncStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "upload_all";

    if (action === "upload_all" || action === "sync_now") {
      const result = await uploadAllToSupabase();
      const updatedStats = await getSyncStats();

      return NextResponse.json({
        success: result.success,
        message: result.message || "Đồng bộ Supabase thành công!",
        result,
        stats: updatedStats,
      });
    }

    return NextResponse.json({ error: "Thao tác không hỗ trợ" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
