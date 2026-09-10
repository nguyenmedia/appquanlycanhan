import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const items = await prisma.learningItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, type = "book", author, totalUnits = 100, completedUnits = 0, unitType = "pages", status = "reading", notes } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề tài liệu/khóa học là bắt buộc" }, { status: 400 });
    }

    const item = await prisma.learningItem.create({
      data: {
        userId: user.id,
        title: title.trim(),
        type,
        author,
        totalUnits: Number(totalUnits),
        completedUnits: Number(completedUnits),
        unitType,
        status,
        notes,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { id, completedUnits, status, rating, notes } = body;

    if (!id) return NextResponse.json({ error: "Thiếu ID mục học tập" }, { status: 400 });

    const item = await prisma.learningItem.updateMany({
      where: { id, userId: user.id },
      data: {
        completedUnits: completedUnits !== undefined ? Number(completedUnits) : undefined,
        status: status !== undefined ? status : undefined,
        rating: rating !== undefined ? Number(rating) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });

    await prisma.learningItem.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa mục học tập" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
