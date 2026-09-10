import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { title, message, priority = "info", targetAudience = "all", ctaText, ctaLink } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Tiêu đề và nội dung là bắt buộc" }, { status: 400 });
    }

    const ann = await prisma.announcement.create({
      data: {
        title,
        message,
        priority,
        targetAudience,
        ctaText,
        ctaLink,
        isActive: true,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "create_announcement",
        entityType: "announcement",
        entityId: ann.id,
        detailsJson: JSON.stringify({ title, priority }),
      },
    });

    return NextResponse.json({ success: true, announcement: ann });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID thông báo" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Đã xóa thông báo" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
