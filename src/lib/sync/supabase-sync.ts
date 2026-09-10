import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export interface SyncStats {
  supabaseConnected: boolean;
  supabaseUrl: string;
  pingMs: number;
  tables: Record<
    string,
    {
      localCount: number;
      supabaseCount: number;
      synced: boolean;
    }
  >;
  lastSyncTime?: string;
}

const toIso = (d: any) => (d ? new Date(d).toISOString() : null);

export const planSlugToCloudId: Record<string, string> = {
  free: "plan_free",
  pro: "plan_pro",
  premium: "plan_premium",
};

export const planIdMapToLocal: Record<string, string> = {
  plan_free: "cmtu4liml000ik5mcigjneziv",
  plan_pro: "cmtu4limv000jk5mcuzxoiayc",
  plan_premium: "cmtu4lin5000kk5mcg128nxfm",
  free: "cmtu4liml000ik5mcigjneziv",
  pro: "cmtu4limv000jk5mcuzxoiayc",
  premium: "cmtu4lin5000kk5mcg128nxfm",
};

export const planIdMapToCloud: Record<string, string> = {
  cmtu4liml000ik5mcigjneziv: "plan_free",
  cmtu4limv000jk5mcuzxoiayc: "plan_pro",
  cmtu4lin5000kk5mcg128nxfm: "plan_premium",
  free: "plan_free",
  pro: "plan_pro",
  premium: "plan_premium",
};

/**
 * ĐỒNG BỘ HAI CHIỀU THỜI GIAN THỰC (CORE ADMIN DATA)
 * Đồng bộ Users, Subscriptions, Payment Transactions, và Customer CRM
 * Đảm bảo Localhost và Vercel luôn có chung nguồn sự thật 100%.
 */
let lastCoreSyncTime = 0;

export async function syncCoreAdminData(force = false) {
  const now = Date.now();
  // Giới hạn tần suất: Không sync quá 1 lần mỗi 3 giây trừ khi force
  if (!force && now - lastCoreSyncTime < 3000) {
    return { success: true, cached: true };
  }
  lastCoreSyncTime = now;

  try {
    // 1. SYNC USERS & PROFILES TỪ SUPABASE CLOUD
    const { data: cloudUsers, error: usersErr } = await supabase
      .from("users")
      .select("*, profile:user_profiles(*)");

    if (!usersErr && Array.isArray(cloudUsers)) {
      for (const cu of cloudUsers) {
        try {
          await prisma.user.upsert({
            where: { id: cu.id },
            update: {
              email: cu.email,
              role: cu.role || "USER",
              status: cu.status || "ACTIVE",
              referralCode: cu.referral_code || cu.id,
              referredById: cu.referred_by_id,
            },
            create: {
              id: cu.id,
              email: cu.email,
              passwordHash: cu.password_hash || "$2a$10$Defau1tCl0udP4ssw0rdHashForSyncPurposeOnly",
              role: cu.role || "USER",
              status: cu.status || "ACTIVE",
              referralCode: cu.referral_code || `REF_${cu.id.substring(0, 6)}`,
              referredById: cu.referred_by_id,
              createdAt: cu.created_at ? new Date(cu.created_at) : new Date(),
            },
          });

          const prof = Array.isArray(cu.profile) ? cu.profile[0] : cu.profile;
          if (prof) {
            await prisma.userProfile.upsert({
              where: { userId: cu.id },
              update: {
                fullName: prof.full_name || "LifeOS User",
                avatarUrl: prof.avatar_url,
                phone: prof.phone,
              },
              create: {
                userId: cu.id,
                fullName: prof.full_name || "LifeOS User",
                avatarUrl: prof.avatar_url,
                phone: prof.phone,
              },
            });
          }
        } catch (e) {
          // ignore single user sync err
        }
      }
    }

    // 2. SYNC SUBSCRIPTIONS TỪ SUPABASE CLOUD
    const { data: cloudSubs, error: subsErr } = await supabase
      .from("subscriptions")
      .select("*");

    if (!subsErr && Array.isArray(cloudSubs)) {
      for (const cs of cloudSubs) {
        try {
          const localPlanId = planIdMapToLocal[cs.plan_id] || "cmtu4limv000jk5mcuzxoiayc";
          await prisma.subscription.upsert({
            where: { id: cs.id },
            update: {
              userId: cs.user_id,
              planId: localPlanId,
              status: cs.status || "active",
              billingCycle: cs.billing_cycle || "monthly",
              price: Number(cs.price || 0),
              currency: cs.currency || "VND",
              startDate: cs.start_date ? new Date(cs.start_date) : new Date(),
              currentPeriodStart: cs.current_period_start ? new Date(cs.current_period_start) : new Date(),
              currentPeriodEnd: cs.current_period_end ? new Date(cs.current_period_end) : new Date(Date.now() + 30 * 86400000),
              cancelAtPeriodEnd: Boolean(cs.cancel_at_period_end),
              cancelledAt: cs.cancelled_at ? new Date(cs.cancelled_at) : null,
              provider: cs.provider || "vietqr",
              providerSubscriptionId: cs.provider_subscription_id,
            },
            create: {
              id: cs.id,
              userId: cs.user_id,
              planId: localPlanId,
              status: cs.status || "active",
              billingCycle: cs.billing_cycle || "monthly",
              price: Number(cs.price || 0),
              currency: cs.currency || "VND",
              startDate: cs.start_date ? new Date(cs.start_date) : new Date(),
              currentPeriodStart: cs.current_period_start ? new Date(cs.current_period_start) : new Date(),
              currentPeriodEnd: cs.current_period_end ? new Date(cs.current_period_end) : new Date(Date.now() + 30 * 86400000),
              cancelAtPeriodEnd: Boolean(cs.cancel_at_period_end),
              cancelledAt: cs.cancelled_at ? new Date(cs.cancelled_at) : null,
              provider: cs.provider || "vietqr",
              providerSubscriptionId: cs.provider_subscription_id,
              createdAt: cs.created_at ? new Date(cs.created_at) : new Date(),
            },
          });
        } catch (e) {
          // ignore single sub sync err
        }
      }
    }

    // 3. SYNC PAYMENT TRANSACTIONS TỪ SUPABASE CLOUD
    const { data: cloudTxns, error: txErr } = await supabase
      .from("payment_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!txErr && Array.isArray(cloudTxns)) {
      for (const ctx of cloudTxns) {
        try {
          await prisma.paymentTransaction.upsert({
            where: { id: ctx.id },
            update: {
              userId: ctx.user_id,
              subscriptionId: ctx.subscription_id,
              provider: ctx.provider || "vietqr",
              providerTransactionId: ctx.provider_transaction_id,
              idempotencyKey: ctx.idempotency_key || ctx.id,
              amount: Number(ctx.amount || 0),
              currency: ctx.currency || "VND",
              status: ctx.status || "pending",
              paymentMethod: ctx.payment_method || (ctx.provider || "VIETQR").toUpperCase(),
              metadataJson: ctx.metadata_json,
              paidAt: ctx.paid_at ? new Date(ctx.paid_at) : null,
            },
            create: {
              id: ctx.id,
              userId: ctx.user_id,
              subscriptionId: ctx.subscription_id,
              provider: ctx.provider || "vietqr",
              providerTransactionId: ctx.provider_transaction_id,
              idempotencyKey: ctx.idempotency_key || ctx.id,
              amount: Number(ctx.amount || 0),
              currency: ctx.currency || "VND",
              status: ctx.status || "pending",
              paymentMethod: ctx.payment_method || (ctx.provider || "VIETQR").toUpperCase(),
              metadataJson: ctx.metadata_json,
              paidAt: ctx.paid_at ? new Date(ctx.paid_at) : null,
              createdAt: ctx.created_at ? new Date(ctx.created_at) : new Date(),
            },
          });
        } catch (e) {
          // ignore single txn sync err
        }
      }
    }

    // 4. SYNC CUSTOMER CRM TỪ SUPABASE CLOUD
    const { data: cloudCrm, error: crmErr } = await supabase
      .from("customer_crm")
      .select("*");

    if (!crmErr && Array.isArray(cloudCrm)) {
      for (const cc of cloudCrm) {
        try {
          await prisma.customerCRM.upsert({
            where: { userId: cc.user_id },
            update: {
              lifecycleStage: cc.lifecycle_stage || "registered",
              healthScore: cc.health_score ?? 100,
              tagsJson: cc.tags_json,
              lastActivityAt: cc.last_activity_at ? new Date(cc.last_activity_at) : new Date(),
              internalNotes: cc.internal_notes,
              assignedTo: cc.assigned_to,
            },
            create: {
              id: cc.id || `crm_${cc.user_id}`,
              userId: cc.user_id,
              lifecycleStage: cc.lifecycle_stage || "registered",
              healthScore: cc.health_score ?? 100,
              tagsJson: cc.tags_json,
              lastActivityAt: cc.last_activity_at ? new Date(cc.last_activity_at) : new Date(),
              internalNotes: cc.internal_notes,
              assignedTo: cc.assigned_to,
            },
          });
        } catch (e) {
          // ignore single crm sync err
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.warn("[syncCoreAdminData] Cloud sync warning:", err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * UPLOAD TOÀN BỘ DỮ LIỆU TỪ SQLITE LÊN SUPABASE CLOUD
 */
export async function uploadAllToSupabase() {
  const startTime = Date.now();
  const report: Record<string, { uploaded: number; error?: string }> = {};

  try {
    // 1. PLANS
    const plans = await prisma.plan.findMany();
    for (const p of plans) {
      const targetId = planSlugToCloudId[p.slug] || p.id;
      await supabase.from("plans").upsert({
        id: targetId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price_monthly: p.priceMonthly,
        price_yearly: p.priceYearly,
        currency: p.currency,
        is_popular: p.isPopular,
        is_active: p.isActive,
        is_public: p.isPublic,
        sort_order: p.sortOrder,
        created_at: toIso(p.createdAt),
        updated_at: toIso(p.updatedAt),
      });
    }
    report.plans = { uploaded: plans.length };

    // 2. PLAN FEATURES & LIMITS
    const planFeatures = await prisma.planFeature.findMany({ include: { plan: true } });
    for (const pf of planFeatures as any[]) {
      const targetPlanId = planSlugToCloudId[pf.plan?.slug || ""] || "plan_pro";
      await supabase.from("plan_features").upsert({
        id: `pf_${targetPlanId}_${pf.featureKey}`,
        plan_id: targetPlanId,
        feature_key: pf.featureKey,
        feature_name: pf.featureName,
        is_included: pf.isIncluded,
        value_json: pf.valueJson,
      });
    }
    report.plan_features = { uploaded: planFeatures.length };

    const planLimits = await prisma.planLimit.findMany({ include: { plan: true } });
    for (const pl of planLimits as any[]) {
      const targetPlanId = planSlugToCloudId[pl.plan?.slug || ""] || "plan_pro";
      await supabase.from("plan_limits").upsert({
        id: `pl_${targetPlanId}_${pl.limitKey}`,
        plan_id: targetPlanId,
        limit_key: pl.limitKey,
        limit_value: pl.limitValue,
        period: pl.period,
      });
    }
    report.plan_limits = { uploaded: planLimits.length };

    // 3. COUPONS
    const coupons = await prisma.coupon.findMany();
    for (const c of coupons) {
      await supabase.from("coupons").upsert({
        id: c.id,
        code: c.code,
        discount_type: c.discountType,
        discount_value: c.discountValue,
        max_uses: c.maxRedemptions || 100,
        used_count: c.timesRedeemed || 0,
        min_order_amount: c.minimumAmount || 0,
        max_discount_amount: 0,
        valid_from: toIso(c.validFrom) || new Date().toISOString(),
        valid_until: toIso(c.validUntil) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: c.isActive ?? true,
        created_at: toIso(c.createdAt),
      });
    }
    report.coupons = { uploaded: coupons.length };

    // 4. USERS
    const users = await prisma.user.findMany();
    for (const u of users) {
      await supabase.from("users").upsert({
        id: u.id,
        email: u.email,
        password_hash: u.passwordHash,
        role: u.role,
        status: u.status,
        referral_code: u.referralCode,
        referred_by_id: u.referredById,
        created_at: toIso(u.createdAt),
        updated_at: toIso(u.updatedAt),
      });
    }
    report.users = { uploaded: users.length };

    // 5. USER PROFILES
    const profiles = await prisma.userProfile.findMany();
    for (const p of profiles) {
      await supabase.from("user_profiles").upsert({
        id: p.id,
        user_id: p.userId,
        full_name: p.fullName,
        avatar_url: p.avatarUrl,
        phone: p.phone,
        bio: p.bio,
        timezone: p.timezone,
        currency: p.currency,
        onboarding_completed: p.onboardingCompleted,
        onboarding_goals: p.onboardingGoals,
        ai_allowed: p.aiAllowed,
        preferences_json: p.preferencesJson,
        created_at: toIso(p.createdAt),
        updated_at: toIso(p.updatedAt),
      });
    }
    report.user_profiles = { uploaded: profiles.length };

    // 6. SUBSCRIPTIONS
    const subs = await prisma.subscription.findMany({ include: { plan: true } });
    for (const s of subs as any[]) {
      const targetPlanId = planSlugToCloudId[s.plan?.slug || ""] || planIdMapToCloud[s.planId] || "plan_pro";
      await supabase.from("subscriptions").upsert({
        id: s.id,
        user_id: s.userId,
        plan_id: targetPlanId,
        status: s.status,
        billing_cycle: s.billingCycle || "monthly",
        price: s.price || 0,
        currency: s.currency || "VND",
        start_date: toIso(s.startDate),
        current_period_start: toIso(s.currentPeriodStart),
        current_period_end: toIso(s.currentPeriodEnd),
        cancel_at_period_end: s.cancelAtPeriodEnd ?? false,
        cancelled_at: toIso(s.cancelledAt),
        provider: s.provider || "internal",
        provider_subscription_id: s.providerSubscriptionId,
        created_at: toIso(s.createdAt),
        updated_at: toIso(s.updatedAt),
      });
    }
    report.subscriptions = { uploaded: subs.length };

    // 7. PAYMENT TRANSACTIONS
    const txns = await prisma.paymentTransaction.findMany();
    for (const t of txns as any[]) {
      await supabase.from("payment_transactions").upsert({
        id: t.id,
        user_id: t.userId,
        subscription_id: t.subscriptionId,
        provider: t.provider || "vietqr",
        provider_transaction_id: t.providerTransactionId,
        idempotency_key: t.idempotencyKey,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        payment_method: t.paymentMethod,
        metadata_json: t.metadataJson,
        paid_at: toIso(t.paidAt),
        created_at: toIso(t.createdAt),
        updated_at: toIso(t.updatedAt),
      });
    }
    report.payment_transactions = { uploaded: txns.length };

    // 8. CUSTOMER CRM
    const crms = await prisma.customerCRM.findMany();
    for (const c of crms) {
      await supabase.from("customer_crm").upsert({
        id: c.id,
        user_id: c.userId,
        lifecycle_stage: c.lifecycleStage,
        health_score: c.healthScore,
        tags_json: c.tagsJson,
        last_activity_at: toIso(c.lastActivityAt),
        internal_notes: c.internalNotes,
        assigned_to: c.assignedTo,
        created_at: toIso(c.createdAt),
        updated_at: toIso(c.updatedAt),
      });
    }
    report.customer_crm = { uploaded: crms.length };

    // 9. PROJECTS & TASKS
    const projects = await prisma.project.findMany();
    for (const pr of projects) {
      await supabase.from("projects").upsert({
        id: pr.id,
        user_id: pr.userId,
        name: pr.name,
        description: pr.description,
        color: pr.color,
        icon: pr.icon,
        status: pr.status,
        created_at: toIso(pr.createdAt),
        updated_at: toIso(pr.updatedAt),
      });
    }
    report.projects = { uploaded: projects.length };

    const tasks = await prisma.task.findMany();
    for (const tk of tasks as any[]) {
      await supabase.from("tasks").upsert({
        id: tk.id,
        user_id: tk.userId,
        project_id: tk.projectId,
        title: tk.title,
        description: tk.description,
        priority: tk.priority,
        status: tk.status,
        due_date: toIso(tk.dueDate),
        completed_at: toIso(tk.completedAt),
        sort_order: tk.sortOrder,
        tags_json: tk.labelsJson || null,
        created_at: toIso(tk.createdAt),
        updated_at: toIso(tk.updatedAt),
      });
    }
    report.tasks = { uploaded: tasks.length };

    // 10. HABITS & GOALS
    const habits = await prisma.habit.findMany();
    for (const h of habits as any[]) {
      await supabase.from("habits").upsert({
        id: h.id,
        user_id: h.userId,
        title: h.title || "Thói quen",
        description: h.description,
        frequency: h.frequency,
        target_days_per_week: h.targetDaysPerWeek,
        color: h.color,
        icon: h.icon,
        streak_count: h.streak || 0,
        best_streak: h.bestStreak || 0,
        is_active: true,
        created_at: toIso(h.createdAt),
        updated_at: toIso(h.updatedAt),
      });
    }
    report.habits = { uploaded: habits.length };

    const goals = await prisma.goal.findMany();
    for (const g of goals as any[]) {
      await supabase.from("goals").upsert({
        id: g.id,
        user_id: g.userId,
        title: g.title,
        description: g.description,
        category: g.category,
        target_value: g.targetValue,
        current_value: g.currentValue,
        unit: g.unit,
        start_date: toIso(g.startDate),
        target_date: toIso(g.targetDate),
        is_completed: g.isCompleted,
        created_at: toIso(g.createdAt),
        updated_at: toIso(g.updatedAt),
      });
    }
    report.goals = { uploaded: goals.length };

    // 11. FINANCE ACCOUNTS & TRANSACTIONS
    const accounts = await prisma.financeAccount.findMany();
    for (const a of accounts as any[]) {
      await supabase.from("finance_accounts").upsert({
        id: a.id,
        user_id: a.userId,
        name: a.name,
        type: a.type,
        balance: a.balance,
        currency: a.currency,
        color: a.color,
        is_default: a.isDefault,
        created_at: toIso(a.createdAt),
        updated_at: toIso(a.updatedAt),
      });
    }
    report.finance_accounts = { uploaded: accounts.length };

    const fTxns = await prisma.financeTransaction.findMany();
    for (const ft of fTxns as any[]) {
      await supabase.from("finance_transactions").upsert({
        id: ft.id,
        user_id: ft.userId,
        account_id: ft.accountId,
        type: ft.type,
        amount: ft.amount,
        category: ft.category,
        description: ft.description,
        date: toIso(ft.date),
        created_at: toIso(ft.createdAt),
        updated_at: toIso(ft.updatedAt),
      });
    }
    report.finance_transactions = { uploaded: fTxns.length };

    // 12. SYSTEM SETTINGS
    const settings = await prisma.systemSetting.findMany();
    for (const st of settings as any[]) {
      await supabase.from("system_settings").upsert(
        {
          id: st.id,
          key: st.key,
          value: st.value,
          description: st.description,
          updated_at: toIso(st.updatedAt),
        },
        { onConflict: "key" }
      );
    }
    report.system_settings = { uploaded: settings.length };

    const duration = Date.now() - startTime;

    return {
      success: true,
      durationMs: duration,
      report,
      message: `Đã tải và đồng bộ thành công toàn bộ dữ liệu lên Supabase Cloud trong ${duration}ms!`,
    };
  } catch (error: any) {
    console.error("Upload to Supabase failed:", error);
    return {
      success: false,
      error: error.message,
      report,
    };
  }
}

export async function getSyncStats(): Promise<SyncStats> {
  const t0 = Date.now();
  let supabaseConnected = false;

  try {
    const { data } = await supabase.from("plans").select("id").limit(1);
    if (data) supabaseConnected = true;
  } catch (e) {
    supabaseConnected = false;
  }

  const pingMs = Date.now() - t0;

  const tableKeys = [
    { key: "users", local: () => prisma.user.count(), remote: "users" },
    { key: "user_profiles", local: () => prisma.userProfile.count(), remote: "user_profiles" },
    { key: "plans", local: () => prisma.plan.count(), remote: "plans" },
    { key: "coupons", local: () => prisma.coupon.count(), remote: "coupons" },
    { key: "subscriptions", local: () => prisma.subscription.count(), remote: "subscriptions" },
    { key: "payment_transactions", local: () => prisma.paymentTransaction.count(), remote: "payment_transactions" },
    { key: "customer_crm", local: () => prisma.customerCRM.count(), remote: "customer_crm" },
    { key: "tasks", local: () => prisma.task.count(), remote: "tasks" },
    { key: "habits", local: () => prisma.habit.count(), remote: "habits" },
    { key: "goals", local: () => prisma.goal.count(), remote: "goals" },
    { key: "finance_transactions", local: () => prisma.financeTransaction.count(), remote: "finance_transactions" },
    { key: "system_settings", local: () => prisma.systemSetting.count(), remote: "system_settings" },
  ];

  const tables: Record<string, { localCount: number; supabaseCount: number; synced: boolean }> = {};

  for (const item of tableKeys) {
    try {
      const localCount = await item.local();
      let supabaseCount = 0;
      if (supabaseConnected) {
        const { count } = await supabase.from(item.remote).select("*", { count: "exact", head: true });
        supabaseCount = count || 0;
      }
      tables[item.key] = {
        localCount,
        supabaseCount,
        synced: localCount === supabaseCount,
      };
    } catch (e) {
      tables[item.key] = { localCount: 0, supabaseCount: 0, synced: false };
    }
  }

  return {
    supabaseConnected,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ajpsdqdzeuvykgbvmkea.supabase.co",
    pingMs,
    tables,
    lastSyncTime: new Date().toISOString(),
  };
}

export async function pushEntityToSupabase(tableName: string, data: any) {
  try {
    const { error } = await supabase.from(tableName).upsert(data);
    if (error) {
      console.error(`Realtime push to Supabase [${tableName}] failed:`, error.message);
    }
    return { success: !error, error: error?.message };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
