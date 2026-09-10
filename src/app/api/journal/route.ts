import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const entries = await prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    });
    return NextResponse.json({ success: true, entries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { date, mood = 3, title, reflection, gratitude, learnings } = body;

    const dateStr = date || new Date().toISOString().slice(0, 10);

    if (!reflection || !reflection.trim()) {
      return NextResponse.json({ error: "Nội dung phản tư không được để trống" }, { status: 400 });
    }

    const entry = await prisma.journalEntry.upsert({
      where: { userId_date: { userId: user.id, date: dateStr } },
      update: {
        mood: Number(mood),
        title,
        reflection: reflection.trim(),
        gratitude,
        learnings,
      },
      create: {
        userId: user.id,
        date: dateStr,
        mood: Number(mood),
        title,
        reflection: reflection.trim(),
        gratitude,
        learnings,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
