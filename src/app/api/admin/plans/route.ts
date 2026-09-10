import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const plans = await prisma.plan.findMany({
      include: { features: true, limits: true, _count: { select: { subscriptions: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { name, slug, priceMonthly, priceYearly, description, isPopular = false, limits, features } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Tên gói và Slug là bắt buộc" }, { status: 400 });
    }

    const existing = await prisma.plan.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug gói đã tồn tại" }, { status: 400 });
    }

    const planCount = await prisma.plan.count();

    const plan = await prisma.plan.create({
      data: {
        name,
        slug: slug.trim().toLowerCase(),
        description: description || "",
        priceMonthly: Number(priceMonthly) || 0,
        priceYearly: Number(priceYearly) || 0,
        currency: "VND",
        isPopular: Boolean(isPopular),
        isActive: true,
        isPublic: true,
        sortOrder: planCount + 1,
      },
    });

    // Create limits if provided
    if (limits && typeof limits === "object") {
      for (const [key, val] of Object.entries(limits)) {
        await prisma.planLimit.create({
          data: { planId: plan.id, limitKey: key, limitValue: Number(val) },
        });
      }
    }

    // Create features if provided
    if (features && typeof features === "object") {
      for (const [key, isEnabled] of Object.entries(features)) {
        await prisma.planFeature.create({
          data: { planId: plan.id, featureKey: key, isEnabled: Boolean(isEnabled) },
        });
      }
    }

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "create_plan",
        entityType: "plan",
        entityId: plan.id,
        detailsJson: JSON.stringify({ name, slug, priceMonthly }),
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { id, name, priceMonthly, priceYearly, description, isActive, isPopular, limits, features } = body;

    if (!id) return NextResponse.json({ error: "Thiếu ID gói" }, { status: 400 });

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        priceMonthly: priceMonthly !== undefined ? Number(priceMonthly) : undefined,
        priceYearly: priceYearly !== undefined ? Number(priceYearly) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        isPopular: isPopular !== undefined ? isPopular : undefined,
      },
    });

    // Update limits if provided
    if (limits && typeof limits === "object") {
      for (const [key, val] of Object.entries(limits)) {
        await prisma.planLimit.upsert({
          where: { planId_limitKey: { planId: id, limitKey: key } },
          update: { limitValue: Number(val) },
          create: { planId: id, limitKey: key, limitValue: Number(val) },
        });
      }
    }

    // Update features if provided
    if (features && typeof features === "object") {
      for (const [key, isEnabled] of Object.entries(features)) {
        await prisma.planFeature.upsert({
          where: { planId_featureKey: { planId: id, featureKey: key } },
          update: { isEnabled: Boolean(isEnabled) },
          create: { planId: id, featureKey: key, isEnabled: Boolean(isEnabled) },
        });
      }
    }

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "update_plan",
        entityType: "plan",
        entityId: id,
        detailsJson: JSON.stringify({ name, priceMonthly, isPopular, isActive }),
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID gói" }, { status: 400 });

    const subCount = await prisma.subscription.count({ where: { planId: id } });
    if (subCount > 0) {
      return NextResponse.json({ error: `Không thể xóa gói đang có ${subCount} thuê bao kích hoạt` }, { status: 400 });
    }

    await prisma.plan.delete({ where: { id } });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "delete_plan",
        entityType: "plan",
        entityId: id,
        detailsJson: JSON.stringify({ deletedPlanId: id }),
      },
    });

    return NextResponse.json({ success: true, message: "Đã xóa gói cước" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
