import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { setMaintenanceMode } from "@/lib/maintenance";

export async function GET(req: NextRequest) {
  try {
    let settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    if (!settings || settings.length === 0) {
      const { data: sbSettings } = await supabase
        .from("system_settings")
        .select("*")
        .order("key", { ascending: true });

      if (sbSettings && sbSettings.length > 0) {
        settings = sbSettings.map((s: any) => ({
          id: s.id,
          key: s.key,
          value: s.value,
          description: s.description,
          updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
        }));
      }
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: "Danh sách cài đặt không hợp lệ" }, { status: 400 });
    }

    for (const item of settings) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: String(item.value) },
        create: { key: item.key, value: String(item.value), description: item.description },
      });

      if (item.key === "maintenance_mode") {
        await setMaintenanceMode(item.value === "true", admin.id);
      }
    }

    // Đồng bộ tức thời lên Supabase Cloud
    try {
      const sbRows = settings.map((s: any) => ({
        key: s.key,
        value: String(s.value),
        description: s.description || null,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("system_settings").upsert(sbRows, { onConflict: "key" });
    } catch (sbErr) {
      console.warn("[Admin Settings] Supabase sync warning:", sbErr);
    }

    return NextResponse.json({ success: true, message: "Đã lưu cài đặt hệ thống thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

