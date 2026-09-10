import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { fullName, goals, primaryTarget } = body;

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName: fullName || undefined,
        onboardingGoals: goals ? JSON.stringify(goals) : undefined,
        bio: primaryTarget ? `Mục tiêu: ${primaryTarget}` : undefined,
        onboardingCompleted: true,
      },
      create: {
        userId: user.id,
        fullName: fullName || "Người dùng LifeOS",
        onboardingGoals: goals ? JSON.stringify(goals) : undefined,
        bio: primaryTarget ? `Mục tiêu: ${primaryTarget}` : undefined,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true, message: "Hoàn tất thiết lập ban đầu thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi cập nhật onboarding" }, { status: 400 });
  }
}
