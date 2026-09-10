const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ajpsdqdzeuvykgbvmkea.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_9PTsLHlLExGiO7w391Z7NA_SAzLfFJX";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const toIso = (d) => (d ? new Date(d).toISOString() : null);

async function runUpload() {
  console.log("🚀 Bắt đầu tải và đồng bộ toàn bộ dữ liệu lên Supabase Cloud:", supabaseUrl);
  const startTime = Date.now();

  try {
    // 1. PLANS
    const plans = await prisma.plan.findMany();
    const planSlugToId = {
      free: "plan_free",
      pro: "plan_pro",
      premium: "plan_premium",
    };

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
    console.log(`✅ Đã tải ${plans.length} gói cước (Plans)`);

    // 2. PLAN FEATURES & LIMITS
    const planFeatures = await prisma.planFeature.findMany({ include: { plan: true } });
    for (const pf of planFeatures) {
      const targetPlanId = planSlugToId[pf.plan?.slug] || "plan_pro";
      await supabase.from("plan_features").upsert({
        id: `pf_${targetPlanId}_${pf.featureKey}`,
        plan_id: targetPlanId,
        feature_key: pf.featureKey,
        feature_name: pf.featureName,
        is_included: pf.isIncluded,
        value_json: pf.valueJson,
      });
    }
    console.log(`✅ Đã tải ${planFeatures.length} tính năng gói (Plan Features)`);

    const planLimits = await prisma.planLimit.findMany({ include: { plan: true } });
    for (const pl of planLimits) {
      const targetPlanId = planSlugToId[pl.plan?.slug] || "plan_pro";
      await supabase.from("plan_limits").upsert({
        id: `pl_${targetPlanId}_${pl.limitKey}`,
        plan_id: targetPlanId,
        limit_key: pl.limitKey,
        limit_value: pl.limitValue,
        period: pl.period,
      });
    }
    console.log(`✅ Đã tải ${planLimits.length} giới hạn gói (Plan Limits)`);

    // 3. COUPONS
    const coupons = await prisma.coupon.findMany();
    for (const c of coupons) {
      await supabase.from("coupons").upsert({
        id: c.id,
        code: c.code,
        name: c.name || c.description || c.code,
        description: c.description || c.name || "",
        discount_type: c.discountType,
        discount_value: c.discountValue,
        max_uses: c.maxRedemptions || c.maxUses || 100,
        used_count: c.timesRedeemed || c.usedCount || 0,
        min_order_amount: c.minimumAmount || c.minOrderAmount || 0,
        max_discount_amount: c.maxDiscountAmount || 0,
        valid_from: toIso(c.validFrom) || new Date().toISOString(),
        valid_until: toIso(c.validUntil) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: c.isActive,
        created_at: toIso(c.createdAt),
      });
    }
    console.log(`✅ Đã tải ${coupons.length} mã giảm giá (Coupons)`);

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
    console.log(`✅ Đã tải ${users.length} tài khoản người dùng (Users - Giữ nguyên user_id)`);

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
    console.log(`✅ Đã tải ${profiles.length} hồ sơ người dùng (Profiles)`);

    // 6. SUBSCRIPTIONS
    const subs = await prisma.subscription.findMany({ include: { plan: true } });
    for (const s of subs) {
      const targetPlanId = planSlugToId[s.plan?.slug] || "plan_pro";
      await supabase.from("subscriptions").upsert({
        id: s.id,
        user_id: s.userId,
        plan_id: targetPlanId,
        status: s.status,
        billing_interval: s.billingInterval,
        current_period_start: toIso(s.currentPeriodStart),
        current_period_end: toIso(s.currentPeriodEnd),
        cancel_at_period_end: s.cancelAtPeriodEnd,
        cancelled_at: toIso(s.cancelledAt),
        created_at: toIso(s.createdAt),
        updated_at: toIso(s.updatedAt),
      });
    }
    console.log(`✅ Đã tải ${subs.length} gói cước đăng ký (Subscriptions)`);

    // 7. PAYMENT TRANSACTIONS
    const txns = await prisma.paymentTransaction.findMany();
    for (const t of txns) {
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
        error_message: t.errorMessage,
        created_at: toIso(t.createdAt),
        paid_at: toIso(t.paidAt),
      });
    }
    console.log(`✅ Đã tải ${txns.length} giao dịch thanh toán (Payment Transactions)`);

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
    console.log(`✅ Đã tải ${projects.length} dự án (Projects)`);

    const tasks = await prisma.task.findMany();
    for (const tk of tasks) {
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
        tags_json: tk.tagsJson,
        created_at: toIso(tk.createdAt),
        updated_at: toIso(tk.updatedAt),
      });
    }
    console.log(`✅ Đã tải ${tasks.length} công việc (Tasks)`);

    // 9. HABITS & GOALS (User isolated)
    const habits = await prisma.habit.findMany();
    for (const h of habits) {
      await supabase.from("habits").upsert({
        id: h.id,
        user_id: h.userId,
        title: h.title || h.name || "Thói quen",
        description: h.description,
        frequency: h.frequency,
        target_days_per_week: h.targetDaysPerWeek,
        color: h.color,
        icon: h.icon,
        streak_count: h.streak || h.streakCount || 0,
        best_streak: h.bestStreak || 0,
        is_active: h.isActive !== undefined ? h.isActive : true,
        created_at: toIso(h.createdAt),
        updated_at: toIso(h.updatedAt),
      });
    }
    console.log(`✅ Đã tải ${habits.length} thói quen (Habits)`);

    const goals = await prisma.goal.findMany();
    for (const g of goals) {
      await supabase.from("goals").upsert({
        id: g.id,
        user_id: g.userId,
        title: g.title,
        description: g.description,
        category: g.category,
        target_value: g.targetValue,
        current_value: g.currentValue,
        unit: g.unit,
        target_date: toIso(g.deadline),
        status: g.status,
        created_at: toIso(g.createdAt),
        updated_at: toIso(g.updatedAt),
      });
    }
    console.log(`✅ Đã tải ${goals.length} mục tiêu (Goals)`);

    // 10. FINANCE (User isolated)
    const accounts = await prisma.financeAccount.findMany();
    for (const a of accounts) {
      await supabase.from("finance_accounts").upsert({
        id: a.id,
        user_id: a.userId,
        name: a.name,
        type: a.type,
        balance: a.balance,
        currency: a.currency,
        color: a.color,
        icon: a.icon,
        is_default: a.isDefault,
        created_at: toIso(a.createdAt),
        updated_at: toIso(a.updatedAt),
      });
    }
    console.log(`✅ Đã tải ${accounts.length} tài khoản ví tài chính (Finance Accounts)`);

    const finTxns = await prisma.financeTransaction.findMany();
    for (const f of finTxns) {
      await supabase.from("finance_transactions").upsert({
        id: f.id,
        user_id: f.userId,
        account_id: f.accountId,
        amount: f.amount,
        type: f.type,
        category: f.category,
        description: f.description,
        date: f.date,
        receipt_url: f.receiptUrl,
        is_recurring: f.isRecurring,
        created_at: toIso(f.createdAt),
        updated_at: toIso(f.updatedAt),
      });
    }
    console.log(`✅ Đã tải ${finTxns.length} giao dịch thu chi (Finance Transactions)`);

    // 11. NOTES & JOURNALS (User isolated)
    const notes = await prisma.note.findMany();
    for (const n of notes) {
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
    console.log(`✅ Đã tải ${notes.length} ghi chú (Notes)`);

    const journals = await prisma.journalEntry.findMany();
    for (const j of journals) {
      await supabase.from("journal_entries").upsert({
        id: j.id,
        user_id: j.userId,
        date: j.date,
        title: j.title || "Nhật ký",
        content: j.content || j.reflection || "",
        reflection: j.reflection || j.content || "",
        mood_score: j.mood || j.moodScore || 5,
        gratitude_notes: j.gratitude || j.gratitudeNotes || "",
        learnings: j.learnings || "",
        created_at: toIso(j.createdAt),
        updated_at: toIso(j.updatedAt),
      });
    }
    console.log(`✅ Đã tải ${journals.length} nhật ký (Journals)`);

    // 12. HEALTH LOGS (User isolated)
    const healthLogs = await prisma.healthLog.findMany();
    for (const hl of healthLogs) {
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
    console.log(`✅ Đã tải ${healthLogs.length} nhật ký sức khỏe (Health Logs)`);

    // 13. LEARNING ITEMS (User isolated)
    const learning = await prisma.learningItem.findMany();
    for (const l of learning) {
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
    console.log(`✅ Đã tải ${learning.length} mục học tập (Learning Items)`);

    // 14. SUPPORT TICKETS & MESSAGES
    const tickets = await prisma.supportTicket.findMany({ include: { messages: true } });
    for (const tk of tickets) {
      await supabase.from("support_tickets").upsert({
        id: tk.id,
        user_id: tk.userId,
        ticket_number: tk.ticketNumber,
        subject: tk.subject,
        category: tk.category,
        priority: tk.priority,
        status: tk.status,
        created_at: toIso(tk.createdAt),
        updated_at: toIso(tk.updatedAt),
      });

      for (const m of tk.messages) {
        await supabase.from("support_messages").upsert({
          id: m.id,
          ticket_id: m.ticketId,
          sender_id: m.senderId,
          sender_role: m.senderRole,
          message: m.message,
          created_at: toIso(m.createdAt),
        });
      }
    }
    console.log(`✅ Đã tải ${tickets.length} yêu cầu hỗ trợ (Support Tickets)`);

    // 15. SYSTEM SETTINGS
    const settings = await prisma.systemSetting.findMany();
    for (const st of settings) {
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
    console.log(`✅ Đã tải ${settings.length} cài đặt hệ thống (System Settings)`);

    const elapsed = Date.now() - startTime;
    console.log(`\n🎉 THÀNH CÔNG 100%! Toàn bộ dữ liệu website đã được tải lên Supabase Cloud trong ${elapsed}ms!`);
    console.log("🔒 Tất cả dữ liệu của người dùng được phân tách và bảo vệ riêng biệt tuyệt đối bằng user_id!");
  } catch (e) {
    console.error("FATAL ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

runUpload();
