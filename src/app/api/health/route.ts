import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const logs = await prisma.healthLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { date, weightKg, sleepHours, waterMl, exerciseMinutes, moodScore, notes } = body;

    const dateStr = date || new Date().toISOString().slice(0, 10);

    const log = await prisma.healthLog.upsert({
      where: { userId_date: { userId: user.id, date: dateStr } },
      update: {
        weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
        sleepHours: sleepHours !== undefined ? Number(sleepHours) : undefined,
        waterMl: waterMl !== undefined ? Number(waterMl) : undefined,
        exerciseMinutes: exerciseMinutes !== undefined ? Number(exerciseMinutes) : undefined,
        moodScore: moodScore !== undefined ? Number(moodScore) : undefined,
        notes,
      },
      create: {
        userId: user.id,
        date: dateStr,
        weightKg: weightKg ? Number(weightKg) : null,
        sleepHours: sleepHours ? Number(sleepHours) : null,
        waterMl: waterMl ? Number(waterMl) : null,
        exerciseMinutes: exerciseMinutes ? Number(exerciseMinutes) : null,
        moodScore: moodScore ? Number(moodScore) : 3,
        notes,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
