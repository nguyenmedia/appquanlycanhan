import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkLimit } from "@/lib/entitlement";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        tasks: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === "done").length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      return {
        ...p,
        totalTasks,
        completedTasks,
        progress,
      };
    });

    return NextResponse.json({ success: true, projects: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { name, description, color = "#6366f1", targetDate } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên dự án không được để trống" }, { status: 400 });
    }

    // Check project limit
    const currentCount = await prisma.project.count({ where: { userId: user.id } });
    const limitCheck = await checkLimit(user.id, "projects", currentCount);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Bạn đã đạt giới hạn tối đa ${limitCheck.limit} dự án của gói hiện tại. Vui lòng nâng cấp gói Pro để tạo không giới hạn.`,
          requiresUpgrade: true,
          limitKey: "projects",
        },
        { status: 403 }
      );
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description,
        color,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID dự án" }, { status: 400 });

    await prisma.project.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa dự án" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
