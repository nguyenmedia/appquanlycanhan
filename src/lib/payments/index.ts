import { IPaymentProvider } from "./types";
import { VNPayProvider } from "./vnpay";
import { MoMoProvider } from "./momo";
import { StripeProvider } from "./stripe";
import { VietQRProvider } from "./vietqr";
import prisma from "../prisma";
import { supabase } from "../supabase";
import { notifyPaymentSuccess } from "../telegram";

export const providers: Record<string, IPaymentProvider> = {
  vietqr: new VietQRProvider(),
  vnpay: new VNPayProvider(),
  momo: new MoMoProvider(),
  stripe: new StripeProvider(),
};

export function getPaymentProvider(name: string): IPaymentProvider {
  const provider = providers[name.toLowerCase()];
  if (!provider) {
    throw new Error(`Unsupported payment provider: ${name}`);
  }
  return provider;
}

export async function processSuccessfulPayment({
  transactionId,
  providerTransactionId,
  amount,
  provider,
}: {
  transactionId: string;
  providerTransactionId?: string;
  amount: number;
  provider: string;
}) {
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { idempotencyKey: transactionId },
    include: { user: true },
  });

  if (!transaction) {
    throw new Error(`Giao dịch ${transactionId} không tồn tại trên hệ thống`);
  }

  if (transaction.status === "success") {
    // Idempotent: already processed
    return { alreadyProcessed: true, transaction };
  }

  // 1. Phân tích Metadata để lấy thông tin gói cước khách hàng mua
  let metadata: {
    planId?: string;
    planSlug?: string;
    planName?: string;
    billingCycle?: "monthly" | "yearly";
    couponCode?: string;
  } = {};

  try {
    if (transaction.metadataJson) {
      metadata = JSON.parse(transaction.metadataJson);
    }
  } catch (e) {
    console.error("Failed to parse metadata", e);
  }

  // 2. Tìm chính xác Plan tương ứng (ưu tiên planId -> planSlug -> planName -> đối chiếu theo số tiền)
  let plan = null;

  if (metadata.planId) {
    plan = await prisma.plan.findUnique({
      where: { id: metadata.planId },
      include: { limits: true },
    });
  }

  if (!plan && metadata.planSlug) {
    plan = await prisma.plan.findUnique({
      where: { slug: metadata.planSlug },
      include: { limits: true },
    });
  }

  if (!plan && metadata.planName) {
    plan = await prisma.plan.findFirst({
      where: { name: metadata.planName },
      include: { limits: true },
    });
  }

  // Phỏng đoán chuẩn xác nếu metadata bị thiếu: căn cứ theo số tiền giao dịch
  if (!plan) {
    const inferredSlug = amount >= 400000 ? "premium" : "pro";
    plan = await prisma.plan.findUnique({
      where: { slug: inferredSlug },
      include: { limits: true },
    });
  }

  // Fallback an toàn: gói Pro
  if (!plan) {
    plan = await prisma.plan.findFirst({
      where: { slug: "pro" },
      include: { limits: true },
    });
  }

  if (!plan) {
    throw new Error("Không thể xác định gói cước để kích hoạt cho khách hàng");
  }

  // 3. Tính toán chu kỳ & thời hạn sử dụng chính xác
  const billingCycle = metadata.billingCycle || (amount >= 1000000 ? "yearly" : "monthly");
  const periodDays = billingCycle === "yearly" ? 365 : 30;
  const now = new Date();
  const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

  // 4. Cập nhật trạng thái giao dịch
  const updatedTx = await prisma.paymentTransaction.update({
    where: { id: transaction.id },
    data: {
      status: "success",
      paidAt: now,
      providerTransactionId: providerTransactionId || transaction.providerTransactionId,
    },
  });

  // 5. Chuyển trạng thái các gói cước cũ đang active sang 'replaced' để kích hoạt gói mới duy nhất
  await prisma.subscription.updateMany({
    where: {
      userId: transaction.userId,
      status: "active",
    },
    data: {
      status: "replaced",
    },
  });

  // 6. Tạo gói cước mới ACTIVE chuẩn xác
  const subscription = await prisma.subscription.create({
    data: {
      userId: transaction.userId,
      planId: plan.id,
      status: "active",
      billingCycle,
      price: amount,
      currency: "VND",
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      provider,
      providerSubscriptionId: providerTransactionId,
    },
  });

  // Liên kết giao dịch với gói cước vừa kích hoạt
  await prisma.paymentTransaction.update({
    where: { id: updatedTx.id },
    data: { subscriptionId: subscription.id },
  });

  // Ghi nhật ký sự kiện gói cước
  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId: subscription.id,
      eventType: "activated",
      detailsJson: JSON.stringify({
        plan: plan.name,
        planSlug: plan.slug,
        cycle: billingCycle,
        amount,
        provider,
        approvedBy: providerTransactionId,
      }),
    },
  });

  // 7. Tạo hóa đơn thanh toán
  const invoiceNum = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  await prisma.invoice.create({
    data: {
      invoiceNumber: invoiceNum,
      userId: transaction.userId,
      transactionId: updatedTx.id,
      planName: plan.name,
      billingCycle,
      amount,
      currency: "VND",
      taxAmount: 0,
      provider,
      status: "paid",
    },
  });

  // 8. Tự động cấp hạn mức AI Credits tương ứng của gói
  let aiCredits = plan.limits?.find((l) => l.limitKey === "ai_credits")?.limitValue;
  if (!aiCredits || aiCredits <= 0) {
    aiCredits = plan.slug === "premium" ? 300 : plan.slug === "pro" ? 100 : 20;
  }

  const lastLedger = await prisma.aICreditLedger.findFirst({
    where: { userId: transaction.userId },
    orderBy: { createdAt: "desc" },
  });
  const currentBalance = lastLedger ? lastLedger.balanceAfter : 0;
  const newBalance = currentBalance + aiCredits;

  await prisma.aICreditLedger.create({
    data: {
      userId: transaction.userId,
      type: "grant",
      amount: aiCredits,
      balanceAfter: newBalance,
      feature: "subscription_upgrade",
      description: `Kích hoạt gói ${plan.name} (${billingCycle === "yearly" ? "12 tháng" : "30 ngày"})`,
    },
  });

  // 9. Cập nhật hồ sơ CRM
  await prisma.customerCRM.upsert({
    where: { userId: transaction.userId },
    update: {
      lifecycleStage: "paid",
      healthScore: 100,
      lastActivityAt: now,
    },
    create: {
      userId: transaction.userId,
      lifecycleStage: "paid",
      healthScore: 100,
      tagsJson: JSON.stringify(["Paid Customer", plan.name]),
      lastActivityAt: now,
    },
  });

  // 10. ĐỒNG BỘ THỜI GIAN THỰC LÊN SUPABASE CLOUD
  try {
    await supabase.from("subscriptions").upsert({
      id: subscription.id,
      user_id: transaction.userId,
      plan_id: plan.id,
      status: "active",
      billing_cycle: billingCycle,
      price: amount,
      start_date: now.toISOString(),
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      provider,
    });

    await supabase.from("payment_transactions").upsert({
      id: updatedTx.id,
      user_id: transaction.userId,
      subscription_id: subscription.id,
      amount,
      currency: "VND",
      status: "success",
      payment_method: provider.toUpperCase(),
      paid_at: now.toISOString(),
    });
  } catch (sbSyncErr) {
    console.warn("[Payment Activation] Supabase cloud sync notice:", sbSyncErr);
  }

  // 11. Xử lý thưởng hoa hồng người giới thiệu (nếu có)
  const user = await prisma.user.findUnique({ where: { id: transaction.userId } });
  if (user?.referredById) {
    const referral = await prisma.referral.findFirst({
      where: {
        referrerId: user.referredById,
        referredUserId: user.id,
        status: "pending",
      },
    });

    if (referral) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: "rewarded",
          completedAt: now,
        },
      });

      const referrerActiveSub = await prisma.subscription.findFirst({
        where: { userId: user.referredById, status: "active" },
        orderBy: { createdAt: "desc" },
      });

      if (referrerActiveSub) {
        const extDate = new Date(
          referrerActiveSub.currentPeriodEnd.getTime() + referral.rewardDays * 24 * 60 * 60 * 1000
        );
        await prisma.subscription.update({
          where: { id: referrerActiveSub.id },
          data: { currentPeriodEnd: extDate },
        });
      }

      const referrerLedger = await prisma.aICreditLedger.findFirst({
        where: { userId: user.referredById },
        orderBy: { createdAt: "desc" },
      });
      const refBal = referrerLedger ? referrerLedger.balanceAfter : 0;
      await prisma.aICreditLedger.create({
        data: {
          userId: user.referredById,
          type: "bonus",
          amount: 50,
          balanceAfter: refBal + 50,
          feature: "referral_bonus",
          description: `Thưởng 50 credits & +${referral.rewardDays} ngày Pro từ người được giới thiệu thanh toán`,
        },
      });
    }
  }

  // 12. Gửi thông báo Telegram tức thì đến Admin báo kích hoạt thành công
  (async () => {
    try {
      const u = await prisma.user.findUnique({ where: { id: transaction.userId }, select: { email: true } });
      const approverName = providerTransactionId?.startsWith("ADMIN_APPROVED_")
        ? "Admin (Duyệt thủ công)"
        : provider.toUpperCase();

      await notifyPaymentSuccess({
        orderId: updatedTx.id,
        userEmail: u?.email || "Khách hàng",
        planName: plan.name,
        amount,
        approvedBy: approverName,
        billingCycle,
        aiCredits,
      });
    } catch (e) {
      console.error("Telegram notification error:", e);
    }
  })();

  return {
    alreadyProcessed: false,
    transaction: updatedTx,
    subscription,
    planName: plan.name,
    planSlug: plan.slug,
    billingCycle,
    aiCredits,
  };
}
