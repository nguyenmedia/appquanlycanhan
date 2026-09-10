import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkLimit } from "@/lib/entitlement";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: { milestones: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, goals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, description, category = "personal", targetValue = 100, unit = "%", targetDate, milestones } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề mục tiêu không được để trống" }, { status: 400 });
    }

    // Check goals limit
    const count = await prisma.goal.count({ where: { userId: user.id } });
    const limitCheck = await checkLimit(user.id, "goals", count);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Bạn đã đạt giới hạn tối đa ${limitCheck.limit} mục tiêu của gói hiện tại. Vui lòng nâng cấp gói Pro để tạo không giới hạn.`,
          requiresUpgrade: true,
          limitKey: "goals",
        },
        { status: 403 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description,
        category,
        targetValue: Number(targetValue),
        unit,
        targetDate: targetDate ? new Date(targetDate) : null,
        milestones: milestones && Array.isArray(milestones)
          ? {
              create: milestones.map((m: any, idx: number) => ({
                title: typeof m === "string" ? m : m.title,
                sortOrder: idx,
              })),
            }
          : undefined,
      },
      include: { milestones: true },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { id, currentProgress, status, toggleMilestoneId } = body;

    if (!id) return NextResponse.json({ error: "Thiếu ID mục tiêu" }, { status: 400 });

    const existing = await prisma.goal.findFirst({
      where: { id, userId: user.id },
      include: { milestones: true },
    });

    if (!existing) return NextResponse.json({ error: "Không tìm thấy mục tiêu" }, { status: 404 });

    if (toggleMilestoneId) {
      const ms = existing.milestones.find((m) => m.id === toggleMilestoneId);
      if (ms) {
        await prisma.goalMilestone.update({
          where: { id: toggleMilestoneId },
          data: { isCompleted: !ms.isCompleted },
        });

        // Recalculate progress if milestones exist
        const updatedMs = await prisma.goalMilestone.findMany({ where: { goalId: id } });
        const completedCount = updatedMs.filter((m) => m.isCompleted).length;
        const newProgress = Math.round((completedCount / updatedMs.length) * existing.targetValue);

        const updatedGoal = await prisma.goal.update({
          where: { id },
          data: {
            currentProgress: newProgress,
            status: newProgress >= existing.targetValue ? "achieved" : "in_progress",
          },
          include: { milestones: true },
        });

        return NextResponse.json({ success: true, goal: updatedGoal });
      }
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        currentProgress: currentProgress !== undefined ? Number(currentProgress) : undefined,
        status: status !== undefined ? status : undefined,
      },
      include: { milestones: true },
    });

    return NextResponse.json({ success: true, goal: updatedGoal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID mục tiêu" }, { status: 400 });

    await prisma.goal.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa mục tiêu" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
