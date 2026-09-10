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

export async function uploadAllToSupabase() {
  const startTime = Date.now();
  const report: Record<string, { uploaded: number; error?: string }> = {};

  try {
    const planSlugToId: Record<string, string> = {
      free: "plan_free",
      pro: "plan_pro",
      premium: "plan_premium",
    };

    // 1. PLANS
    const plans = await prisma.plan.findMany();
    for (const p of plans) {
      const targetId = planSlugToId[p.slug] || p.id;
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
      const targetPlanId = planSlugToId[pf.plan?.slug || ""] || "plan_pro";
      await supabase.from("plan_features").upsert({
        id: `pf_${targetPlanId}_${pf.featureKey}`,
        plan_id: targetPlanId,
        feature_key: pf.featureKey,
        feature_name: pf.featureName || pf.featureKey,
        is_included: pf.isIncluded ?? true,
        value_json: pf.valueJson || null,
      });
    }
    report.plan_features = { uploaded: planFeatures.length };

    const planLimits = await prisma.planLimit.findMany({ include: { plan: true } });
    for (const pl of planLimits as any[]) {
      const targetPlanId = planSlugToId[pl.plan?.slug || ""] || "plan_pro";
      await supabase.from("plan_limits").upsert({
        id: `pl_${targetPlanId}_${pl.limitKey}`,
        plan_id: targetPlanId,
        limit_key: pl.limitKey,
        limit_value: pl.limitValue,
        period: pl.period || "forever",
      });
    }
    report.plan_limits = { uploaded: planLimits.length };

    // 3. COUPONS
    const coupons = await prisma.coupon.findMany();
    for (const c of coupons as any[]) {
      await supabase.from("coupons").upsert({
        id: c.id,
        code: c.code,
        name: c.name || c.code,
        description: c.description || c.name || "",
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

    // 4. USERS (With user_id isolation)
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
      const targetPlanId = planSlugToId[s.plan?.slug || ""] || "plan_pro";
      await supabase.from("subscriptions").upsert({
        id: s.id,
        user_id: s.userId,
        plan_id: targetPlanId,
        status: s.status,
        billing_interval: "monthly",
        current_period_start: toIso(s.currentPeriodStart),
        current_period_end: toIso(s.currentPeriodEnd),
        cancel_at_period_end: s.cancelAtPeriodEnd ?? false,
        cancelled_at: toIso(s.cancelledAt),
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
        idempotency_key: t.idempotencyKey,
        provider: t.provider,
        provider_transaction_id: t.providerTransactionId,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        payment_method: t.paymentMethod,
        metadata_json: t.metadataJson,
        error_message: null,
        created_at: toIso(t.createdAt),
        paid_at: toIso(t.paidAt),
      });
    }
    report.payment_transactions = { uploaded: txns.length };

    // 8. PROJECTS & TASKS (User isolated)
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

    // 9. HABITS & GOALS (User isolated)
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
        current_value: g.currentProgress || 0,
        unit: g.unit,
        target_date: toIso(g.targetDate),
        status: g.status,
        created_at: toIso(g.createdAt),
        updated_at: toIso(g.updatedAt),
      });
    }
    report.goals = { uploaded: goals.length };

    // 10. FINANCE (User isolated)
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
        icon: "wallet",
        is_default: a.isDefault,
        created_at: toIso(a.createdAt),
        updated_at: toIso(a.updatedAt),
      });
    }
    report.finance_accounts = { uploaded: accounts.length };

    const finTxns = await prisma.financeTransaction.findMany();
    for (const f of finTxns as any[]) {
      await supabase.from("finance_transactions").upsert({
        id: f.id,
        user_id: f.userId,
        account_id: f.accountId,
        amount: f.amount,
        type: f.type,
        category: f.category,
        description: f.description,
        date: toIso(f.date) || new Date().toISOString(),
        receipt_url: f.receiptUrl,
        is_recurring: false,
        created_at: toIso(f.createdAt),
        updated_at: toIso(f.updatedAt),
      });
    }
    report.finance_transactions = { uploaded: finTxns.length };

    // 11. NOTES & JOURNALS (User isolated)
    const notes = await prisma.note.findMany();
    for (const n of notes as any[]) {
      await supabase.from("notes").upsert({
        id: n.id,
        user_id: n.userId,
        title: n.title,
        content: n.content,
        tags_json: n.tagsJson,
        is_pinned: n.isPinned,
        is_archived: n.isArchived,
        created_at: toIso(n.createdAt),
        updated_at: toIso(n.updatedAt),
      });
    }
    report.notes = { uploaded: notes.length };

    const journals = await prisma.journalEntry.findMany();
    for (const j of journals as any[]) {
      await supabase.from("journal_entries").upsert({
        id: j.id,
        user_id: j.userId,
        date: j.date,
        title: j.title || "Nhật ký",
        content: j.reflection || "",
        reflection: j.reflection || "",
        mood_score: j.mood || 5,
        gratitude_notes: j.gratitude || "",
        learnings: j.learnings || "",
        created_at: toIso(j.createdAt),
        updated_at: toIso(j.updatedAt),
      });
    }
    report.journal_entries = { uploaded: journals.length };

    // 12. HEALTH LOGS (User isolated)
    const healthLogs = await prisma.healthLog.findMany();
    for (const hl of healthLogs as any[]) {
      await supabase.from("health_logs").upsert({
        id: hl.id,
        user_id: hl.userId,
        date: hl.date,
        weight_kg: hl.weightKg,
        sleep_hours: hl.sleepHours,
        water_ml: hl.waterMl,
        exercise_minutes: hl.exerciseMinutes,
        mood_score: hl.moodScore,
        notes: hl.notes,
        created_at: toIso(hl.createdAt),
      });
    }
    report.health_logs = { uploaded: healthLogs.length };

    // 13. LEARNING ITEMS (User isolated)
    const learning = await prisma.learningItem.findMany();
    for (const l of learning as any[]) {
      await supabase.from("learning_items").upsert({
        id: l.id,
        user_id: l.userId,
        title: l.title,
        type: l.type,
        author: l.author,
        total_units: l.totalUnits,
        completed_units: l.completedUnits,
        unit_type: l.unitType,
        status: l.status,
        notes: l.notes,
        rating: l.rating,
        created_at: toIso(l.createdAt),
        updated_at: toIso(l.updatedAt),
      });
    }
    report.learning_items = { uploaded: learning.length };

    // 14. SYSTEM SETTINGS
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
    { key: "tasks", local: () => prisma.task.count(), remote: "tasks" },
    { key: "habits", local: () => prisma.habit.count(), remote: "habits" },
    { key: "goals", local: () => prisma.goal.count(), remote: "goals" },
    { key: "finance_transactions", local: () => prisma.financeTransaction.count(), remote: "finance_transactions" },
    { key: "notes", local: () => prisma.note.count(), remote: "notes" },
    { key: "journal_entries", local: () => prisma.journalEntry.count(), remote: "journal_entries" },
    { key: "health_logs", local: () => prisma.healthLog.count(), remote: "health_logs" },
    { key: "learning_items", local: () => prisma.learningItem.count(), remote: "learning_items" },
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
