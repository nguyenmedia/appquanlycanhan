import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyCustomerConfirmedTransfer } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, note } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Thiếu transactionId" }, { status: 400 });
    }

    const tx = await prisma.paymentTransaction.findUnique({
      where: { idempotencyKey: transactionId },
      include: {
        user: { select: { email: true, profile: { select: { fullName: true } } } },
      },
    });

    if (!tx) {
      return NextResponse.json({ error: "Giao dịch không tồn tại" }, { status: 404 });
    }

    // Update status to processing (Waiting for Admin approval)
    await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status: "processing",
      },
    });

    // Real-time Cloud Sync to Supabase
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase
        .from("payment_transactions")
        .update({
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tx.id);
    } catch (sbErr) {
      console.warn("[Notify Admin] Supabase processing status push notice:", sbErr);
    }

    let planName = "LifeOS Pro";
    let customerName = tx.user?.profile?.fullName || "";
    if (tx.metadataJson) {
      try {
        const meta = JSON.parse(tx.metadataJson);
        if (meta.planName) {
          const cycleStr = meta.billingCycle === "yearly" ? "Gói năm (12 tháng)" : "Gói tháng (30 ngày)";
          planName = `${meta.planName} (${cycleStr})`;
        }
      } catch {}
    }

    // Send real-time Telegram alert to Admin
    notifyCustomerConfirmedTransfer({
      orderId: tx.id,
      userEmail: tx.user?.email || "Khách hàng",
      customerName,
      planName,
      amount: tx.amount,
      transferCode: tx.idempotencyKey,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Đã gửi thông báo đến Admin. Vui lòng chờ Admin duyệt trong giây lát!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
