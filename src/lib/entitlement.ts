import prisma from "./prisma";

export async function getUserActivePlan(userId: string) {
  // Check active subscription
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      currentPeriodEnd: { gte: new Date() },
    },
    include: {
      plan: {
        include: {
          features: true,
          limits: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (sub && sub.plan) {
    return sub.plan;
  }

  // Fallback to Free plan
  const freePlan = await prisma.plan.findUnique({
    where: { slug: "free" },
    include: {
      features: true,
      limits: true,
    },
  });

  return freePlan;
}

export async function hasFeature(userId: string, featureKey: string): Promise<boolean> {
  const plan = await getUserActivePlan(userId);
  if (!plan) return false;

  const feature = plan.features.find((f) => f.featureKey === featureKey);
  return feature ? feature.isEnabled : false;
}

export async function checkLimit(
  userId: string,
  limitKey: string,
  currentCount: number
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const plan = await getUserActivePlan(userId);
  if (!plan) {
    return { allowed: false, limit: 0, current: currentCount };
  }

  const limitObj = plan.limits.find((l) => l.limitKey === limitKey);
  const limitValue = limitObj !== undefined ? limitObj.limitValue : 0;

  // -1 indicates unlimited
  if (limitValue === -1) {
    return { allowed: true, limit: -1, current: currentCount };
  }

  return {
    allowed: currentCount < limitValue,
    limit: limitValue,
    current: currentCount,
  };
}

export async function getAICreditBalance(userId: string): Promise<{
  balance: number;
  totalGranted: number;
  totalUsed: number;
}> {
  const ledgers = await prisma.aICreditLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (ledgers.length === 0) {
    // Check user plan to give initial grant if none exists
    const plan = await getUserActivePlan(userId);
    const planAiLimit = plan?.limits.find((l) => l.limitKey === "ai_credits")?.limitValue || 20;

    const initial = await prisma.aICreditLedger.create({
      data: {
        userId,
        type: "grant",
        amount: planAiLimit,
        balanceAfter: planAiLimit,
        feature: "initial_grant",
        description: `Cấp khởi tạo ${planAiLimit} credits gói ${plan?.name || "Free"}`,
      },
    });

    return { balance: initial.balanceAfter, totalGranted: planAiLimit, totalUsed: 0 };
  }

  const latest = ledgers[0];
  const totalGranted = ledgers
    .filter((l) => l.amount > 0)
    .reduce((sum, l) => sum + l.amount, 0);
  const totalUsed = Math.abs(
    ledgers.filter((l) => l.amount < 0).reduce((sum, l) => sum + l.amount, 0)
  );

  return {
    balance: Math.max(0, latest.balanceAfter),
    totalGranted,
    totalUsed,
  };
}
