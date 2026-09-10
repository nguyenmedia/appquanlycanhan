const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();
const supabase = createClient(
  'https://ajpsdqdzeuvykgbvmkea.supabase.co',
  'sb_publishable_9PTsLHlLExGiO7w391Z7NA_SAzLfFJX'
);

const toIso = (d) => (d ? new Date(d).toISOString() : null);

const planMap = {
  free: 'plan_free',
  pro: 'plan_pro',
  premium: 'plan_premium',
};

async function syncAll() {
  console.log('--- BẮT ĐẦU ĐỒNG BỘ TOÀN BỘ DỮ LIỆU TỪ SQLITE LÊN SUPABASE CLOUD ---');

  // 1. Đồng bộ Plans
  console.log('1. Đồng bộ Plans...');
  const plans = await prisma.plan.findMany();
  for (const p of plans) {
    const targetId = planMap[p.slug] || p.id;
    await supabase.from('plans').upsert({
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

  // 2. Đồng bộ Users & Profiles
  console.log('2. Đồng bộ Users & Profiles...');
  const users = await prisma.user.findMany({ include: { profile: true } });
  for (const u of users) {
    await supabase.from('users').upsert({
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

    if (u.profile) {
      await supabase.from('user_profiles').upsert({
        id: u.profile.id || `prof_${u.id}`,
        user_id: u.id,
        full_name: u.profile.fullName || 'LifeOS User',
        avatar_url: u.profile.avatarUrl,
        phone: u.profile.phone,
        bio: u.profile.bio,
        timezone: u.profile.timezone || 'Asia/Ho_Chi_Minh',
        currency: u.profile.currency || 'VND',
        onboarding_completed: u.profile.onboardingCompleted ?? false,
        created_at: toIso(u.profile.createdAt),
        updated_at: toIso(u.profile.updatedAt),
      });
    }
  }

  // 3. Đồng bộ Subscriptions
  console.log('3. Đồng bộ Subscriptions...');
  const subs = await prisma.subscription.findMany({ include: { plan: true } });
  for (const s of subs) {
    const targetPlanId = planMap[s.plan?.slug] || s.planId;
    const { error: subErr } = await supabase.from('subscriptions').upsert({
      id: s.id,
      user_id: s.userId,
      plan_id: targetPlanId,
      status: s.status,
      billing_cycle: s.billingCycle || 'monthly',
      price: s.price || 0,
      currency: s.currency || 'VND',
      start_date: toIso(s.startDate),
      current_period_start: toIso(s.currentPeriodStart),
      current_period_end: toIso(s.currentPeriodEnd),
      cancel_at_period_end: s.cancelAtPeriodEnd ?? false,
      cancelled_at: toIso(s.cancelledAt),
      provider: s.provider || 'internal',
      provider_subscription_id: s.providerSubscriptionId,
      created_at: toIso(s.createdAt),
      updated_at: toIso(s.updatedAt),
    });
    if (subErr) console.error('Lỗi sync subscription:', s.id, subErr);
  }

  // 4. Đồng bộ Payment Transactions
  console.log('4. Đồng bộ Payment Transactions...');
  const txns = await prisma.paymentTransaction.findMany();
  for (const t of txns) {
    const { error: txErr } = await supabase.from('payment_transactions').upsert({
      id: t.id,
      user_id: t.userId,
      subscription_id: t.subscriptionId,
      provider: t.provider,
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
    if (txErr) console.error('Lỗi sync payment transaction:', t.id, txErr);
  }

  // 5. Đồng bộ Customer CRM
  console.log('5. Đồng bộ Customer CRM...');
  const crms = await prisma.customerCRM.findMany();
  for (const c of crms) {
    const { error: crmErr } = await supabase.from('customer_crm').upsert({
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
    if (crmErr) console.error('Lỗi sync CRM:', c.id, crmErr);
  }

  console.log('--- HOÀN TẤT ĐỒNG BỘ LÊN SUPABASE CLOUD THÀNH CÔNG ---');
}

syncAll().catch(console.error);
