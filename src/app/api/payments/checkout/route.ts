import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { validateAndApplyCoupon } from "@/lib/coupons";
import { getPaymentProvider } from "@/lib/payments";
import { notifyNewPaymentOrder } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { planId, billingCycle = "monthly", provider = "vnpay", couponCode } = body;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Gói dịch vụ không hợp lệ hoặc đã bị vô hiệu" }, { status: 400 });
    }

    if (plan.slug === "free") {
      return NextResponse.json({ error: "Gói miễn phí không yêu cầu thanh toán" }, { status: 400 });
    }

    const baseAmount = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
    let finalAmount = baseAmount;
    let appliedCoupon = null;

    if (couponCode) {
      const couponRes = await validateAndApplyCoupon({
        code: couponCode,
        userId: user.id,
        planId: plan.id,
        originalAmount: baseAmount,
      });

      if (couponRes.valid) {
        finalAmount = couponRes.finalAmount;
        appliedCoupon = couponRes.coupon;
      }
    }

    // Generate unique transaction ID & Idempotency Key
    const idempotencyKey = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create pending PaymentTransaction record
    const createdTx = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        provider,
        idempotencyKey,
        amount: finalAmount,
        currency: "VND",
        status: "pending",
        paymentMethod: provider.toUpperCase(),
        metadataJson: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          billingCycle,
          couponCode: appliedCoupon?.code,
          couponDiscount: baseAmount - finalAmount,
        }),
      },
    });

    // Real-time Cloud Sync to Supabase
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("payment_transactions").upsert({
        id: createdTx.id,
        user_id: user.id,
        provider,
        idempotency_key: idempotencyKey,
        amount: finalAmount,
        currency: "VND",
        status: "pending",
        payment_method: provider.toUpperCase(),
        metadata_json: createdTx.metadataJson,
        created_at: createdTx.createdAt.toISOString(),
        updated_at: createdTx.updatedAt.toISOString(),
      });
    } catch (sbErr) {
      console.warn("[Checkout] Supabase pending tx push notice:", sbErr);
    }

    // Send real-time Telegram notification
    notifyNewPaymentOrder({
      orderId: idempotencyKey,
      userEmail: user.email,
      planName: plan.name,
      amount: finalAmount,
      transferCode: idempotencyKey,
      method: provider.toUpperCase(),
    }).catch(console.error);

    // If coupon was applied, record redemption
    if (appliedCoupon) {
      await prisma.couponRedemption.create({
        data: {
          couponId: appliedCoupon.id,
          userId: user.id,
          discountAmount: baseAmount - finalAmount,
        },
      });

      await prisma.coupon.update({
        where: { id: appliedCoupon.id },
        data: { timesRedeemed: { increment: 1 } },
      });
    }

    // Call payment provider abstraction
    const paymentProvider = getPaymentProvider(provider);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/api/payments/callback/${provider}`;

    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const paymentInit = await paymentProvider.createPaymentUrl({
      transactionId: idempotencyKey,
      orderInfo: `Thanh toan goi ${plan.name} (${billingCycle}) LifeOS`,
      amount: finalAmount,
      returnUrl,
      ipAddress: clientIp,
      userId: user.id,
      planId: plan.id,
      billingCycle,
    });

    return NextResponse.json({
      success: true,
      paymentUrl: paymentInit.paymentUrl,
      isSimulated: paymentInit.isSimulated || false,
      transactionId: idempotencyKey,
      amount: finalAmount,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Lỗi khởi tạo thanh toán" }, { status: 400 });
  }
}
