import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { habitId, date, completed = true } = body;

    const dateStr = date || new Date().toISOString().slice(0, 10);

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: user.id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Không tìm thấy thói quen" }, { status: 404 });
    }

    if (completed) {
      await prisma.habitLog.upsert({
        where: { habitId_date: { habitId, date: dateStr } },
        update: { completed: true },
        create: {
          habitId,
          userId: user.id,
          date: dateStr,
          completed: true,
        },
      });
    } else {
      await prisma.habitLog.deleteMany({
        where: { habitId, date: dateStr },
      });
    }

    // Recalculate streak
    const logs = await prisma.habitLog.findMany({
      where: { habitId, completed: true },
      select: { date: true },
      orderBy: { date: "desc" },
    });

    const dates = new Set(logs.map((l) => l.date));
    let streak = 0;
    let checkDate = new Date();

    // If today is not completed yet, check if yesterday was completed
    const todayStr = checkDate.toISOString().slice(0, 10);
    if (!dates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (dates.has(checkDate.toISOString().slice(0, 10))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const bestStreak = Math.max(habit.bestStreak, streak);

    const updated = await prisma.habit.update({
      where: { id: habitId },
      data: { streak, bestStreak },
    });

    return NextResponse.json({ success: true, habit: updated, streak, bestStreak });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
