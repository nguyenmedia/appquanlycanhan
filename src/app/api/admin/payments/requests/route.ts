import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processSuccessfulPayment } from "@/lib/payments";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);

    const pendingTxns = await prisma.paymentTransaction.findMany({
      where: {
        status: { in: ["pending", "processing"] },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = pendingTxns.map((t) => {
      let meta: any = {};
      try {
        if (t.metadataJson) meta = JSON.parse(t.metadataJson);
      } catch (e) {}

      return {
        id: t.id,
        transactionId: t.idempotencyKey,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        provider: t.provider,
        createdAt: t.createdAt,
        user: {
          id: t.user.id,
          email: t.user.email,
          fullName: t.user.profile?.fullName || t.user.email.split("@")[0],
          phone: t.user.profile?.phone || "",
        },
        planName: meta.planName || "LifeOS Pro",
        planId: meta.planId,
        billingCycle: meta.billingCycle || "monthly",
        transferContent: `LIFEOS ${t.idempotencyKey}`,
      };
    });

    return NextResponse.json({
      success: true,
      pendingCount: formatted.length,
      requests: formatted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(req, ["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
    const body = await req.json();
    const { action, transactionId, note } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Thiếu mã giao dịch transactionId" }, { status: 400 });
    }

    const tx = await prisma.paymentTransaction.findUnique({
      where: { idempotencyKey: transactionId },
      include: { user: true },
    });

    if (!tx) {
      return NextResponse.json({ error: "Giao dịch không tồn tại" }, { status: 404 });
    }

    if (action === "approve") {
      // 1. Process successful payment & activate subscription
      const result = await processSuccessfulPayment({
        transactionId: tx.idempotencyKey,
        providerTransactionId: `ADMIN_APPROVED_${admin.email.split("@")[0]}_${Date.now()}`,
        amount: tx.amount,
        provider: tx.provider,
      });

      // 2. Audit log
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "approve_bank_transfer_upgrade",
          entityType: "payment_transaction",
          entityId: tx.id,
          detailsJson: JSON.stringify({
            customerEmail: tx.user.email,
            amount: tx.amount,
            transactionId,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã duyệt thanh toán và tự động kích hoạt đúng gói [${result.planName || "Pro"}] thành công cho khách hàng ${tx.user.email}!`,
        result,
      });
    }

    if (action === "reject") {
      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: "failed",
          errorMessage: note || "Admin từ chối giao dịch do chưa nhận được tiền hoặc sai số tiền",
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "reject_bank_transfer",
          entityType: "payment_transaction",
          entityId: tx.id,
          detailsJson: JSON.stringify({ customerEmail: tx.user.email, note }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Đã từ chối giao dịch",
      });
    }

    return NextResponse.json({ error: "Thao tác không hỗ trợ" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
