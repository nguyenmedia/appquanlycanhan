import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processSuccessfulPayment } from "@/lib/payments";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json({ error: "Thiếu transactionId" }, { status: 400 });
    }

    const tx = await prisma.paymentTransaction.findUnique({
      where: { idempotencyKey: transactionId },
      include: {
        user: { select: { id: true, email: true } },
        subscription: { include: { plan: true } },
      },
    });

    if (!tx) {
      return NextResponse.json({ error: "Giao dịch không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: tx.status,
      amount: tx.amount,
      provider: tx.provider,
      paidAt: tx.paidAt,
      isPaid: tx.status === "success",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Optional manual activation trigger for test / bank confirmation button
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Thiếu transactionId" }, { status: 400 });
    }

    const tx = await prisma.paymentTransaction.findUnique({
      where: { idempotencyKey: transactionId },
    });

    if (!tx) {
      return NextResponse.json({ error: "Giao dịch không tồn tại" }, { status: 404 });
    }

    if (tx.status === "success") {
      return NextResponse.json({ success: true, message: "Giao dịch đã được xác nhận trước đó" });
    }

    const result = await processSuccessfulPayment({
      transactionId: tx.idempotencyKey,
      providerTransactionId: `CONFIRMED_${Date.now()}`,
      amount: tx.amount,
      provider: tx.provider,
    });

    return NextResponse.json({
      success: true,
      message: "Đã xác nhận và kích hoạt gói dịch vụ thành công!",
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
