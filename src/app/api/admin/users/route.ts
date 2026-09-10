import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const planFilter = searchParams.get("plan") || "";
    const roleFilter = searchParams.get("role") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { referralCode: { contains: search } },
      ];
    }
    if (roleFilter) {
      where.role = roleFilter;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        subscriptions: {
          where: { status: "active" },
          include: { plan: true },
          take: 1,
        },
        crmProfile: true,
        aiLedgers: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { tasks: true, habits: true, goals: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    let formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      referralCode: u.referralCode,
      createdAt: u.createdAt,
      fullName: u.profile?.fullName || "Chưa đặt tên",
      phone: u.profile?.phone || "",
      plan: u.subscriptions[0]?.plan?.name || "Free",
      planSlug: u.subscriptions[0]?.plan?.slug || "free",
      lifecycleStage: u.crmProfile?.lifecycleStage || "registered",
      healthScore: u.crmProfile?.healthScore || 100,
      aiCreditBalance: u.aiLedgers[0]?.balanceAfter || 0,
      stats: {
        tasks: u._count.tasks,
        habits: u._count.habits,
        goals: u._count.goals,
      },
    }));

    if (planFilter) {
      formatted = formatted.filter((u) => u.planSlug === planFilter);
    }

    return NextResponse.json({ success: true, users: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { email, password, fullName, role = "USER", planSlug = "free", initialCredits = 20 } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email và mật khẩu là bắt buộc" }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email đã tồn tại trong hệ thống" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        referralCode,
        status: "ACTIVE",
        profile: {
          create: {
            fullName: fullName || email.split("@")[0],
          },
        },
        crmProfile: {
          create: {
            lifecycleStage: planSlug === "free" ? "registered" : "paid",
            healthScore: 100,
          },
        },
      },
    });

    // Create subscription
    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (plan) {
      const now = new Date();
      await prisma.subscription.create({
        data: {
          userId: newUser.id,
          planId: plan.id,
          status: "active",
          billingCycle: "monthly",
          price: plan.priceMonthly,
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          provider: "admin_manual_grant",
        },
      });
    }

    // Initial AI credits
    if (initialCredits > 0) {
      await prisma.aICreditLedger.create({
        data: {
          userId: newUser.id,
          type: "grant",
          amount: Number(initialCredits),
          balanceAfter: Number(initialCredits),
          description: "Tặng thưởng khởi tạo tài khoản từ Admin",
        },
      });
    }

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "create_user_admin",
        entityType: "user",
        entityId: newUser.id,
        detailsJson: JSON.stringify({ email, role, planSlug }),
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { userId, status, role, changePlanSlug, creditBonus, note } = body;

    if (!userId) return NextResponse.json({ error: "Thiếu ID người dùng" }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });

    // Update status or role
    if (status !== undefined || role !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: status || undefined,
          role: role || undefined,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "update_user_status_role",
          entityType: "user",
          entityId: userId,
          detailsJson: JSON.stringify({ status, role }),
        },
      });
    }

    // Add AI credit bonus
    if (creditBonus && Number(creditBonus) > 0) {
      const lastLedger = await prisma.aICreditLedger.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      const currentBalance = lastLedger ? lastLedger.balanceAfter : 0;
      const newBalance = currentBalance + Number(creditBonus);

      await prisma.aICreditLedger.create({
        data: {
          userId,
          type: "bonus",
          amount: Number(creditBonus),
          balanceAfter: newBalance,
          description: note || `Admin cộng thêm ${creditBonus} AI credits`,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "grant_ai_credits",
          entityType: "ai_credit",
          entityId: userId,
          detailsJson: JSON.stringify({ amount: creditBonus, newBalance }),
        },
      });
    }

    // Change plan manually if requested
    if (changePlanSlug) {
      const plan = await prisma.plan.findUnique({ where: { slug: changePlanSlug } });
      if (plan) {
        const now = new Date();
        const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.subscription.create({
          data: {
            userId,
            planId: plan.id,
            status: "active",
            billingCycle: "monthly",
            price: plan.priceMonthly,
            startDate: now,
            currentPeriodStart: now,
            currentPeriodEnd: end,
            provider: "admin_override",
          },
        });

        await prisma.adminAuditLog.create({
          data: {
            adminUserId: admin.id,
            action: "manual_plan_override",
            entityType: "subscription",
            entityId: userId,
            detailsJson: JSON.stringify({ plan: plan.name }),
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Cập nhật tài khoản thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "Thiếu ID người dùng" }, { status: 400 });
    if (userId === admin.id) {
      return NextResponse.json({ error: "Không thể tự xóa tài khoản của chính mình!" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "delete_user",
        entityType: "user",
        entityId: userId,
        detailsJson: JSON.stringify({ deletedUserId: userId }),
      },
    });

    return NextResponse.json({ success: true, message: "Đã xóa người dùng thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
