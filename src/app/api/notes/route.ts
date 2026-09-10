import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkLimit } from "@/lib/entitlement";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    const where: any = { userId: user.id };
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { content: { contains: query } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, content, folder = "General", tags, isPinned = false } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề ghi chú không được để trống" }, { status: 400 });
    }

    // Check notes limit
    const count = await prisma.note.count({ where: { userId: user.id } });
    const limitCheck = await checkLimit(user.id, "notes", count);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Bạn đã đạt giới hạn tối đa ${limitCheck.limit} ghi chú của gói hiện tại. Vui lòng nâng cấp gói Pro để tạo không giới hạn.`,
          requiresUpgrade: true,
          limitKey: "notes",
        },
        { status: 403 }
      );
    }

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content: content || "",
        folder,
        tagsJson: tags ? JSON.stringify(tags) : null,
        isPinned,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { id, title, content, isPinned, folder } = body;

    if (!id) return NextResponse.json({ error: "Thiếu ID ghi chú" }, { status: 400 });

    const note = await prisma.note.updateMany({
      where: { id, userId: user.id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        content: content !== undefined ? content : undefined,
        isPinned: isPinned !== undefined ? isPinned : undefined,
        folder: folder !== undefined ? folder : undefined,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID ghi chú" }, { status: 400 });

    await prisma.note.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa ghi chú" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
