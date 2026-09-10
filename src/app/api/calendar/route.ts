import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const events = await prisma.calendarEvent.findMany({
      where: { userId: user.id },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, description, startTime, endTime, category = "work", color = "#3b82f6", isAllDay = false, location } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: "Tiêu đề, thời gian bắt đầu và kết thúc là bắt buộc" }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        category,
        color,
        isAllDay,
        location,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID sự kiện" }, { status: 400 });

    await prisma.calendarEvent.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa sự kiện" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
