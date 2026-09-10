import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkLimit } from "@/lib/entitlement";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const todayStr = new Date().toISOString().slice(0, 10);

    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      include: {
        logs: {
          where: {
            // Get logs for the last 14 days
            date: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
          },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const enriched = habits.map((h) => {
      const completedToday = h.logs.some((l) => l.date === todayStr && l.completed);
      return {
        ...h,
        completedToday,
      };
    });

    return NextResponse.json({ success: true, habits: enriched, today: todayStr });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, description, frequency = "daily", targetDaysPerWeek = 7, color = "#10b981" } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tên thói quen không được để trống" }, { status: 400 });
    }

    // Check habits limit
    const count = await prisma.habit.count({ where: { userId: user.id } });
    const limitCheck = await checkLimit(user.id, "habits", count);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Bạn đã đạt giới hạn tối đa ${limitCheck.limit} thói quen của gói hiện tại. Vui lòng nâng cấp gói Pro để tạo không giới hạn.`,
          requiresUpgrade: true,
          limitKey: "habits",
        },
        { status: 403 }
      );
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description,
        frequency,
        targetDaysPerWeek: Number(targetDaysPerWeek),
        color,
      },
    });

    return NextResponse.json({ success: true, habit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID thói quen" }, { status: 400 });

    await prisma.habit.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa thói quen" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
