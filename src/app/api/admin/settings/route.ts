import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
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
    }

    return NextResponse.json({ success: true, message: "Đã lưu cài đặt hệ thống" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
