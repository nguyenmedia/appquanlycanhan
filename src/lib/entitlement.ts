import prisma from "./prisma";
import { supabase } from "./supabase";

export async function getUserActivePlan(userId: string) {
  // 1. Kiểm tra Subscription đang active trên local Prisma
  let sub = await prisma.subscription.findFirst({
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

  // 2. Nếu local chưa có hoặc vừa cold-start trên Vercel, kiểm tra trực tiếp Supabase Cloud
  if (!sub) {
    try {
      const { data: cloudSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .gte("current_period_end", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cloudSub) {
        const planSlug =
          cloudSub.plan_id === "plan_premium"
            ? "premium"
            : cloudSub.plan_id === "plan_pro"
            ? "pro"
            : "free";

        const localPlan = await prisma.plan.findUnique({
          where: { slug: planSlug },
          include: { features: true, limits: true },
        });

        if (localPlan) {
          try {
            await prisma.subscription.upsert({
              where: { id: cloudSub.id },
              update: {
                status: "active",
                currentPeriodEnd: new Date(cloudSub.current_period_end),
              },
              create: {
                id: cloudSub.id,
                userId,
                planId: localPlan.id,
                status: "active",
                billingCycle: cloudSub.billing_cycle || "yearly",
                price: Number(cloudSub.price || 0),
                currency: cloudSub.currency || "VND",
                startDate: cloudSub.start_date ? new Date(cloudSub.start_date) : new Date(),
                currentPeriodStart: cloudSub.current_period_start ? new Date(cloudSub.current_period_start) : new Date(),
                currentPeriodEnd: new Date(cloudSub.current_period_end),
                provider: cloudSub.provider || "vietqr",
                providerSubscriptionId: cloudSub.provider_subscription_id,
              },
            });
          } catch (e) {}

          return localPlan;
        }
      }
    } catch (sbErr) {
      console.warn("[getUserActivePlan] Supabase query notice:", sbErr);
    }
  }

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
  let ledgers = await prisma.aICreditLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // 1. Nếu trên local SQLite rỗng (ví dụ cold-start Vercel Lambda container mới),
  // truy vấn Supabase Cloud để lấy ledger thật sự
  if (ledgers.length === 0) {
    try {
      const { data: cloudLedgers } = await supabase
        .from("ai_credit_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (cloudLedgers && cloudLedgers.length > 0) {
        for (const cl of cloudLedgers) {
          try {
            await prisma.aICreditLedger.upsert({
              where: { id: cl.id },
              update: {
                balanceAfter: cl.balance_after,
                amount: cl.amount,
                type: cl.type,
              },
              create: {
                id: cl.id,
                userId: cl.user_id,
                type: cl.type,
                amount: cl.amount,
                balanceAfter: cl.balance_after,
                feature: cl.feature,
                model: cl.model,
                description: cl.description,
                createdAt: cl.created_at ? new Date(cl.created_at) : new Date(),
              },
            });
          } catch (e) {}
        }
        ledgers = await prisma.aICreditLedger.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
      }
    } catch (err) {
      console.warn("[getAICreditBalance] Supabase fetch notice:", err);
    }
  }

  // 2. Nếu cả local lẫn Supabase đều chưa có bản ghi, cấp initial grant theo gói thật của user
  if (ledgers.length === 0) {
    const plan = await getUserActivePlan(userId);
    let planAiLimit = plan?.limits?.find((l: any) => l.limitKey === "ai_credits")?.limitValue;
    if (!planAiLimit || planAiLimit <= 0) {
      planAiLimit = plan?.slug === "premium" ? 1000 : plan?.slug === "pro" ? 300 : 20;
    }

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

    // Đồng bộ ngay lên Supabase Cloud
    try {
      await supabase.from("ai_credit_ledger").insert({
        id: initial.id,
        user_id: userId,
        type: "grant",
        amount: planAiLimit,
        balance_after: planAiLimit,
        feature: "initial_grant",
        description: `Cấp khởi tạo ${planAiLimit} credits gói ${plan?.name || "Free"}`,
        created_at: new Date().toISOString(),
      });
    } catch (sbErr) {
      console.warn("[getAICreditBalance] Supabase insert initial grant notice:", sbErr);
    }

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
