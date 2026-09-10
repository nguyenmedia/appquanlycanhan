import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const sessions = await prisma.pomodoroSession.findMany({
      where: { userId: user.id },
      include: { task: true },
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    const totalMinutes = sessions
      .filter((s) => s.completed && s.type === "work")
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return NextResponse.json({ success: true, sessions, totalFocusMinutes: totalMinutes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { taskId, durationMinutes = 25, type = "work" } = body;

    const session = await prisma.pomodoroSession.create({
      data: {
        userId: user.id,
        taskId: taskId || null,
        durationMinutes: Number(durationMinutes),
        type,
        completed: true,
        startedAt: new Date(Date.now() - durationMinutes * 60 * 1000),
        endedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
