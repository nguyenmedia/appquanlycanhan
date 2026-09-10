import { IPaymentProvider } from "./types";
import { VNPayProvider } from "./vnpay";
import { MoMoProvider } from "./momo";
import { StripeProvider } from "./stripe";
import { VietQRProvider } from "./vietqr";
import prisma from "../prisma";
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
    throw new Error(`Transaction ${transactionId} not found`);
  }

  if (transaction.status === "success") {
    // Idempotent: already processed
    return { alreadyProcessed: true, transaction };
  }

  // Parse metadata
  let metadata: { planId?: string; billingCycle?: "monthly" | "yearly"; couponCode?: string } = {};
  try {
    if (transaction.metadataJson) {
      metadata = JSON.parse(transaction.metadataJson);
    }
  } catch (e) {
    console.error("Failed to parse metadata", e);
  }

  const planId = metadata.planId;
  const billingCycle = metadata.billingCycle || "monthly";

  if (!planId) {
    throw new Error("Missing planId in transaction metadata");
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { limits: true },
  });

  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }

  // Calculate period dates
  const now = new Date();
  const periodDays = billingCycle === "yearly" ? 365 : 30;
  const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

  // Update transaction status
  const updatedTx = await prisma.paymentTransaction.update({
    where: { id: transaction.id },
    data: {
      status: "success",
      paidAt: now,
      providerTransactionId: providerTransactionId || transaction.providerTransactionId,
    },
  });

  // Create or update subscription
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

  // Link transaction to subscription
  await prisma.paymentTransaction.update({
    where: { id: updatedTx.id },
    data: { subscriptionId: subscription.id },
  });

  // Log subscription event
  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId: subscription.id,
      eventType: "activated",
      detailsJson: JSON.stringify({
        plan: plan.name,
        cycle: billingCycle,
        amount,
        provider,
      }),
    },
  });

  // Generate Invoice
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

  // Grant AI credits for the new subscription
  const aiCredits = plan.limits.find((l) => l.limitKey === "ai_credits")?.limitValue || 20;
  if (aiCredits > 0) {
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
        description: `Cấp ${aiCredits} credits cho gói ${plan.name}`,
      },
    });
  }

  // Update CRM profile if user is a paid customer
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

  // If user was referred, qualify the referral!
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
      // Mark referral qualified and reward referrer with Pro days
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: "rewarded",
          completedAt: now,
        },
      });

      // Grant Pro reward days to referrer
      const referrerActiveSub = await prisma.subscription.findFirst({
        where: { userId: user.referredById, status: "active" },
        orderBy: { createdAt: "desc" },
      });

      if (referrerActiveSub) {
        // Extend existing subscription
        const extDate = new Date(referrerActiveSub.currentPeriodEnd.getTime() + referral.rewardDays * 24 * 60 * 60 * 1000);
        await prisma.subscription.update({
          where: { id: referrerActiveSub.id },
          data: { currentPeriodEnd: extDate },
        });
      }

      // Bonus AI credits for referrer
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

  // Send real-time Telegram notification to Admin
  (async () => {
    try {
      const u = await prisma.user.findUnique({ where: { id: transaction.userId }, select: { email: true } });
      await notifyPaymentSuccess({
        orderId: updatedTx.id,
        userEmail: u?.email || "Khách hàng",
        planName: plan.name,
        amount,
        approvedBy: provider.toUpperCase(),
      });
    } catch (e) {
      console.error("Telegram notification error:", e);
    }
  })();

  return { alreadyProcessed: false, transaction: updatedTx, subscription };
}
