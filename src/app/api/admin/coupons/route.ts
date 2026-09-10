import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { code, name, discountType = "percentage", discountValue, maxRedemptions = 100, validDays = 90, minimumAmount = 0 } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Mã coupon và giá trị giảm là bắt buộc" }, { status: 400 });
    }

    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + validDays * 24 * 60 * 60 * 1000);

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name || code,
        discountType,
        discountValue: Number(discountValue),
        maxRedemptions: Number(maxRedemptions),
        minimumAmount: Number(minimumAmount),
        validFrom,
        validUntil,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { id, isActive, name, discountValue, maxRedemptions } = body;

    if (!id) return NextResponse.json({ error: "Thiếu ID coupon" }, { status: 400 });

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        name: name !== undefined ? name : undefined,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        maxRedemptions: maxRedemptions !== undefined ? Number(maxRedemptions) : undefined,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Thiếu ID coupon" }, { status: 400 });

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Đã xóa coupon" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
