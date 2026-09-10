import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkLimit } from "@/lib/entitlement";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: any = { userId: user.id };
    if (projectId) where.projectId = projectId;
    if (status && status !== "all") where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: { project: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { title, description, projectId, priority = "medium", dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề công việc không được để trống" }, { status: 400 });
    }

    // Check plan tasks limit
    const currentTasksCount = await prisma.task.count({ where: { userId: user.id } });
    const limitCheck = await checkLimit(user.id, "tasks", currentTasksCount);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Bạn đã đạt giới hạn tối đa ${limitCheck.limit} công việc của gói hiện tại. Vui lòng nâng cấp gói Pro để tạo không giới hạn.`,
          requiresUpgrade: true,
          limitKey: "tasks",
        },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description || null,
        projectId: projectId || null,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "todo",
      },
      include: { project: true },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { id, title, description, status, priority, dueDate, projectId } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID công việc" }, { status: 400 });
    }

    // Verify task belongs to user
    const existing = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy công việc" }, { status: 404 });
    }

    const completedAt = status === "done" && existing.status !== "done" ? new Date() : status && status !== "done" ? null : existing.completedAt;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        projectId: projectId !== undefined ? projectId : undefined,
        completedAt,
      },
      include: { project: true },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID công việc" }, { status: 400 });
    }

    await prisma.task.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa công việc" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
