import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { validateAndApplyCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { code, planId, originalAmount } = body;

    const result = await validateAndApplyCoupon({
      code,
      userId: user.id,
      planId,
      originalAmount: Number(originalAmount),
    });

    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi xác thực coupon" }, { status: 400 });
  }
}
